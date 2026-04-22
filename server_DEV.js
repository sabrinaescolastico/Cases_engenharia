const express = require('express');
const db = require('./database');

const app = express();

app.use(express.json());

app.listen(8080, () => {
    console.log("Server Listening on PORT:", 8080);
  });

  app.get('/clientes', (req,res) => {
    const query = 'SELECT * FROM clientes';
    db.all(query, [], (err,rows) => {
        if (err) 
            return res.status(400).json({error: err.message});
        return res.json(rows);
    })
})

app.get('/clientes/:id', (req,res) => {
    const {id} = req.params;
    const query = 'SELECT * FROM clientes WHERE id = ?';
    db.all(query, [id], (err,rows) => {
        if (err) 
            return res.status(400).json({error: err.message});
        return res.json(rows);
    })
})

app.post('/clientes', (req,res) => {
    const {nome, email } = req.body;
    try
    {
        db.run(`INSERT INTO clientes(nome, email) VALUES(?, ?)`, [nome, email]);
        return res.status(200).json();
    }
    catch(err){
        console.log(err);
        return res.status(400).json(err);
    }
})

app.put('/clientes/:id', (req,res) => {
    const { id } = req.params;
    const {nome, email } = req.body;
    try
    {
        db.run(`UPDATE clientes SET nome = ?, email = ? WHERE id = ?`, [nome, email, id]);
        return res.status(200).json();
    }
    catch(err){
        console.log(err);
        return res.status(400).json(err);
    }
})

app.delete('/clientes/:id', (req,res) => {
    const { id } = req.params;
    try
    {
        db.run(`DELETE FROM clientes WHERE id = ?`, [id]);
        return res.status(200).json();
    }
    catch(err){
        console.log(err);
        return res.status(400).json(err);
    }
})

app.post('/clientes/:id/depositar', (req,res) => {
    const { id } = req.params;
    const { valor } = req.body;
    console.log({id, valor});
    try
    {
        db.run(`UPDATE clientes SET saldo = saldo + ? WHERE id = ?`, [valor, id]);
        return res.status(200).json();
    }
    catch(err){
        console.log(err);
        return res.status(400).json(err);
    }
})

app.post('/clientes/:id/sacar', (req,res) => {
    const { id } = req.params;
    const { valor } = req.body;
    console.log({id, valor});
    try
    {
        db.run(`UPDATE clientes SET saldo = saldo - ? WHERE id = ?`, [valor, id]);
        return res.status(200).json();
    }
    catch(err){
        console.log(err);
        return res.status(400).json(err);
    }
})