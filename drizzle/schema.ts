import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const leadRecords = mysqlTable("lead_records", {
  id: int("id").autoincrement().primaryKey(),
  recordId: varchar("recordId", { length: 80 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["aberto", "finalizado"]).default("aberto").notNull(),
  category: mysqlEnum("category", ["empresa", "individual"]).notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  document: varchar("document", { length: 32 }).notNull(),
  contact: varchar("contact", { length: 320 }).notNull(),
  region: varchar("region", { length: 160 }).notNull(),
  coursesJson: text("coursesJson").notNull(),
  destination: mysqlEnum("destination", ["vendas", "coordenacao"]).notNull(),
  companyLogoUrl: text("companyLogoUrl"),
  protocol: varchar("protocol", { length: 64 }).notNull(),
  summary: text("summary"),
});

export type LeadRecord = typeof leadRecords.$inferSelect;
export type InsertLeadRecord = typeof leadRecords.$inferInsert;
