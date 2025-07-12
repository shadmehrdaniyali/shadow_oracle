const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database('./oracle.db');

db.run(\`
  CREATE TABLE IF NOT EXISTS price_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price_usd REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
\`);

db.get(\`SELECT COUNT(*) as count FROM price_data\`, (err, row) => {
  if (err) return console.error(err);
  if (row.count === 0) {
    db.run(\`INSERT INTO price_data (price_usd) VALUES (?)\`, [1.00]);
  }
});

app.use('/assets', express.static('assets'));

app.get('/price', (req, res) => {
  db.get(
    \`SELECT price_usd FROM price_data ORDER BY timestamp DESC LIMIT 1\`,
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ price: row.price_usd });
    }
  );
});
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});
