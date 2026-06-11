import { openDatabaseSync } from 'expo-sqlite';

/**
 * Single shared SQLite handle for the whole app.
 * The schema is created synchronously on first import so every screen can
 * safely query right away — no race with a layout-level effect.
 */
export const db = openDatabaseSync('ridelog.db');

db.execSync(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    note TEXT,
    cost REAL,
    location TEXT,
    pass_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS bucket_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL,
    created_at TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS passes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    day_price_youth REAL NOT NULL,
    day_price_adult REAL NOT NULL,
    user_group TEXT NOT NULL
  );
`);

export type Activity = {
  id: number;
  date: string;
  category: string;
  title: string;
  note?: string | null;
  cost?: number | null;
  location?: string | null;
  pass_id?: number | null;
};

export type Goal = {
  id: number;
  title: string;
  category: string;
  description?: string | null;
  priority: string;
  created_at: string;
  completed: number;
};

export type Pass = {
  id: number;
  name: string;
  price: number;
  day_price_youth: number;
  day_price_adult: number;
  user_group: string;
};
