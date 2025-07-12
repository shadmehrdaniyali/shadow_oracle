const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prices.db');

// Create table if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    price REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
