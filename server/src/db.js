import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'annapurna.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('meal', 'feeling', 'stool')),
    timestamp TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_entries_type_timestamp ON entries (type, timestamp);
`);

export function insertEntry(type, timestamp, data) {
  const stmt = db.prepare(
    'INSERT INTO entries (type, timestamp, data) VALUES (?, ?, ?)'
  );
  const info = stmt.run(type, timestamp, JSON.stringify(data));
  return { id: info.lastInsertRowid, type, timestamp, data };
}

export function getEntriesInRange(startISO, endISO, type) {
  const rows = type
    ? db
        .prepare(
          'SELECT * FROM entries WHERE type = ? AND timestamp >= ? AND timestamp < ? ORDER BY timestamp ASC'
        )
        .all(type, startISO, endISO)
    : db
        .prepare(
          'SELECT * FROM entries WHERE timestamp >= ? AND timestamp < ? ORDER BY timestamp ASC'
        )
        .all(startISO, endISO);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    timestamp: row.timestamp,
    data: JSON.parse(row.data),
  }));
}

export function getRecentMeals(limit = 5) {
  const rows = db
    .prepare(
      "SELECT * FROM entries WHERE type = 'meal' ORDER BY timestamp DESC LIMIT ?"
    )
    .all(limit);
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    timestamp: row.timestamp,
    data: JSON.parse(row.data),
  }));
}

export default db;
