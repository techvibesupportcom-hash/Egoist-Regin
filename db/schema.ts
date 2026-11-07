import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

// Estado de la comunidad (fichas, clubes, ranking, entrenamientos y notificaciones)
// guardado como documento JSON. Se usa una fila con id = 'main'.
export const appState = pgTable("app_state", {
  id: text().primaryKey(),
  data: jsonb().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
