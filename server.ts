// Servidor local de desarrollo (npm run dev). En Netlify, la API corre en
// netlify/functions/api.mts con Netlify Database como almacenamiento.
import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { registerRoutes, createDefaultDatabase, setDatabase, getDatabase, consumeDirty } = await import('./server/routes.ts');
type DatabaseSchema = ReturnType<typeof createDefaultDatabase>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  const defaultDb = createDefaultDatabase();
  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

setDatabase(loadDatabase());

// Persist to disk after any request that modified the state
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (consumeDirty()) saveDatabase(getDatabase());
  });
  next();
});

registerRoutes(app);

async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const isProduction = process.env.NODE_ENV === 'production' && fs.existsSync(distPath);

  if (isProduction) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const portNumber = Number(PORT) || 3000;
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`Blue Lock Reign of Egoists server running on http://0.0.0.0:${portNumber}`);
  });
}

startServer();
