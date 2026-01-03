const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'financeiro.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT,
    valor REAL,
    categoria TEXT,
    tipo TEXT,
    data DATE
  )
`);

module.exports = db;