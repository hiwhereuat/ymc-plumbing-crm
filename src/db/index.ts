import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("data/ymc.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_first_name TEXT NOT NULL,
    lead_last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    job_type TEXT NOT NULL,
    job_source TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    zip TEXT NOT NULL,
    area TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    plumber TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Job Created',
    sheets_row INTEGER,
    kommo_deal_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);


try {
  sqlite.exec(`ALTER TABLE jobs ADD COLUMN kommo_deal_id INTEGER`);
} catch (e) {

}