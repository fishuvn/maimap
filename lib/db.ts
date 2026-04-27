import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'maimap.db');
let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
    seedIfEmpty(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_banned INTEGER NOT NULL DEFAULT 0,
      avatar_url TEXT,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      country TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0,
      verified_by INTEGER REFERENCES users(id),
      verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id TEXT NOT NULL REFERENCES locations(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id TEXT REFERENCES locations(id),
      post_id INTEGER REFERENCES posts(id),
      parent_id INTEGER REFERENCES comments(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL REFERENCES users(id),
      target_type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      resolved_by INTEGER REFERENCES users(id),
      resolved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    INSERT OR IGNORE INTO site_settings (key, value) VALUES
      ('site_name', 'MaiMap'),
      ('site_description', 'Find maimai DX arcades near you'),
      ('allow_registration', 'true'),
      ('require_post_approval', 'true'),
      ('require_comment_approval', 'true'),
      ('prohibited_keywords', ''),
      ('primary_categories', 'General,Cabinet Status,New Location,Event');
  `);
}

function seedIfEmpty(db: Database.Database) {
  // Always ensure the default admin account exists
  const adminExists = (db.prepare("SELECT COUNT(*) as c FROM users WHERE username = 'admin'").get() as { c: number }).c;
  if (adminExists === 0) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)').run('admin', 'admin@maimap.local', hash, 'admin');
    console.log('[DB] Default admin created: admin / admin123');
  }

  // Seed locations from data/locations.json if the table is empty
  const count = (db.prepare('SELECT COUNT(*) as c FROM locations').get() as { c: number }).c;
  if (count > 0) return;
  const locationsPath = path.join(process.cwd(), 'data', 'locations.json');
  if (!fs.existsSync(locationsPath)) {
    console.warn('[DB] data/locations.json not found — no locations seeded');
    return;
  }
  const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf-8'));
  const insert = db.prepare('INSERT OR IGNORE INTO locations (id, name, address, lat, lng, country) VALUES (?, ?, ?, ?, ?, ?)');
  const insertMany = db.transaction((locs: typeof locations) => {
    for (const loc of locs) insert.run(loc.id, loc.name, loc.address, loc.lat, loc.lng, loc.country);
  });
  insertMany(locations);
  console.log(`[DB] Seeded ${locations.length} locations`);
}
