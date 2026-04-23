const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); //':memory:' faz com que a memoria seja apagada quando reinicia o terminal
//const db = new sqlite3.Database('./database.sqlite');


db.serialize(() => {
    db.run(`CREATE TABLE clientes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        saldo INTEGER NOT NULL DEFAULT 0
    )`);

 db.get("SELECT COUNT(*) as count FROM clientes", (err, row) => {
        if (row.count === 0) {

    db.run(`INSERT INTO clientes(nome, email, saldo) VALUES(?, ?, 0)`, ['TESTE', 'TESTE@TESTE.com.br']);
}
});
});



/*Exportação do dbRun
function dbRun(query, params) {
    return new Promise(function(resolve, reject) {
        db.run(query, params || [], function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
} */
// INSERT/UPDATE/DELETE
function dbRun(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// BUSCAR UM REGISTRO
function dbGet(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// BUSCAR VÁRIOS REGISTROS
function dbAll(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}


module.exports = { db, dbRun, dbGet, dbAll};