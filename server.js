const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Create or open SQLite database
const db = new sqlite3.Database('./oracle.db');

// Create price table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS price_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price_usd REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert initial price if empty
db.get(`SELECT COUNT(*) as count FROM price_data`, (err, row) => {
  if (err) return console.error(err);
  if (row.count === 0) {
    db.run(`INSERT INTO price_data (price_usd) VALUES (?)`, [1.00]);
  }
});

// 🔥 نمایش فایل‌های public مثل logo و info.json
app.use('/assets', express.static('assets'));

// GET /price - return latest price
app.get('/price', (req, res) => {
  db.get(
    `SELECT price_usd FROM price_data ORDER BY timestamp DESC LIMIT 1`,
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ price: row.price_usd });
    }
  );
});

app.listen(port, () => {
  console.log(`Oracle API running on http://localhost:${port}`);
});
