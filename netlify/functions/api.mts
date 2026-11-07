import type { Config } from "@netlify/functions";
import { getDatabase as getNetlifyDatabase } from "@netlify/database";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { appState } from "../../db/schema.js";
import {
  registerRoutes,
  createDefaultDatabase,
  setDatabase,
  getDatabase,
  consumeDirty,
  type ApiRequest,
  type ApiResponse,
  type DatabaseSchema,
} from "../../server/routes.ts";

const STATE_ID = "main";

type Method = "GET" | "POST" | "PUT";
type Handler = (req: ApiRequest, res: ApiResponse) => unknown;
interface Route {
  method: Method;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

// Minimal router compatible with the Express-style route definitions in server/routes.ts
const routes: Route[] = [];
function addRoute(method: Method, path: string, handler: Handler) {
  const keys: string[] = [];
  const pattern = new RegExp(
    "^" +
      path.replace(/:([A-Za-z_]+)/g, (_m, key) => {
        keys.push(key);
        return "([^/]+)";
      }) +
      "/?$"
  );
  routes.push({ method, pattern, keys, handler });
}

registerRoutes({
  get: (path, handler) => addRoute("GET", path, handler),
  post: (path, handler) => addRoute("POST", path, handler),
  put: (path, handler) => addRoute("PUT", path, handler),
});

async function runHandler(handler: Handler, params: Record<string, string>, body: unknown) {
  let statusCode = 200;
  let payload: unknown = null;
  let responded = false;
  const res: ApiResponse = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: unknown) {
      payload = data;
      responded = true;
      return res;
    },
  };
  await handler({ params, body }, res);
  if (!responded) {
    return { statusCode: 500, payload: { error: "Sin respuesta del servidor" } };
  }
  return { statusCode, payload };
}

async function readState(): Promise<DatabaseSchema> {
  const [row] = await db.select().from(appState).where(eq(appState.id, STATE_ID));
  return row ? (row.data as DatabaseSchema) : createDefaultDatabase();
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const method = req.method.toUpperCase() as Method;

  let matched: { route: Route; params: Record<string, string> } | null = null;
  for (const route of routes) {
    if (route.method !== method) continue;
    const m = url.pathname.match(route.pattern);
    if (m) {
      const params: Record<string, string> = {};
      route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      matched = { route, params };
      break;
    }
  }

  if (!matched) {
    return Response.json({ error: "Ruta no encontrada" }, { status: 404 });
  }

  let body: unknown = {};
  if (method !== "GET") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  // Read-only requests (and AI text generation, which never writes): no lock needed
  if (method === "GET" || url.pathname.startsWith("/api/ai/")) {
    setDatabase(await readState());
    const { statusCode, payload } = await runHandler(matched.route.handler, matched.params, body);
    return Response.json(payload, { status: statusCode, headers: { "Cache-Control": "no-store" } });
  }

  // Mutating requests: lock the state row so concurrent submissions never overwrite each other
  const client = await getNetlifyDatabase().pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO app_state (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING",
      [STATE_ID, JSON.stringify(createDefaultDatabase())]
    );
    const { rows } = await client.query("SELECT data FROM app_state WHERE id = $1 FOR UPDATE", [STATE_ID]);
    setDatabase(rows[0].data as DatabaseSchema);

    const { statusCode, payload } = await runHandler(matched.route.handler, matched.params, body);

    if (consumeDirty()) {
      await client.query("UPDATE app_state SET data = $2::jsonb, updated_at = now() WHERE id = $1", [
        STATE_ID,
        JSON.stringify(getDatabase()),
      ]);
    }
    await client.query("COMMIT");
    return Response.json(payload, { status: statusCode, headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("API error:", err);
    return Response.json({ error: err?.message || "Error del servidor" }, { status: 500 });
  } finally {
    client.release();
  }
};

export const config: Config = {
  path: "/api/*",
};
