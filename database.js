const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`CREATE TABLE clientes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        saldo FLOAT
    )`)

    db.run(`INSERT INTO clientes(nome, email, saldo) VALUES(?, ?, 0)`, ['TESTE', 'TESTE@TESTE.com.br']);
})

module.exports = db;