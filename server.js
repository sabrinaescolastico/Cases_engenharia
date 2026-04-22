const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;


app.use(express.json());

/*Uso de funções auxiliares - Function - 
 Function usada no lugar de => para criar contexto próprio e evitar que de erro na hora de buscar a informação
Function tem próprio this. Arrow function herda this do escopo externo.
 "Arrow function é mais moderna e leve, mas function é mais poderosa em controle de contexto." 
*/

  function dbRun(query, params) {
    return new Promise(function(resolve, reject) {
        db.run(query, params || [], function(err) {
            if (err) reject (err);
            else resolve (this);
        
        });
    });
}
/*Solicitar as informações do cliente com GET e informar mensagem de erro caso não preenchido
 Executa consulta que retorna APENAS UMA LINHA *(Ex. SELECT WHERE id =?)
*/
 function dbGet(query, params) {
    return new Promise(function(resolve, reject) {
        db.get(query, params ||[], function (err, row){
            if (err) reject(err);
            else resolve(row);
        });
    });
}
//Consulta todos os clientes, mostra várias linhas, se erro mostrar mensagem de erro.
function dbAll(query, params) {
    return new Promise(function(resolve,reject){
        db.all(query,params || [], function (err, rows) {
            if (err) reject(err);
            else resolve(rows);

        });
    })
}
// Validação de ID padrão 
function validarId(id) {
    const idNumber = Number(id);
    return Number.isInteger(idNumber) && idNumber > 0 ? idNumber : null;
}

/* Consulta o pedido da lista de todos os clientes vai aparecer. O comando Await vai aguardar o resultado para retornar, e em caso de erro
    retorna 500 Internal Server Error: Erro inesperado no servidor.

Get para listar todos os clientes cadastrados no banco. 
Ordem de execução: Consulta SQL> Aguarda resultado com o uso do await > Retorna os dados em Json.
Se erro, retorna o status 500 (erro interno do servidor)

*/
app.get('/clientes', async function(req, res) {
    try{
        const rows = await dbAll('SELECT * FROM clientes');
        return res.json(rows);
    } catch (err){
        return res.status(500).json({error: "Erro interno do servidor"});
    }
});
/* GET - Cliente por id
Busca um cliente específico pelo id informado na URL.
Executa a consulta SQL filtrando ID em SELECT * FROM clientes WHERE Id = ?
Se não encontrar nenhum registro, retorna status 404.
Caso encontre, é retonado em json.
Caso erro, retorna o status 500 com a mensagem de erro.
*/
app.get ('/clientes/:id', async function(req, res) {
    try{
        const idNumber = validarId(req.params.id);

        if(!idNumber){
            return res.status(400).json({error: "ID inválido"});
        }

        const row = await dbGet ('SELECT * FROM clientes WHERE  id = ?', [idNumber])
        if (!row) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }
        return res.json(row);

    } catch (err) {
        return res.status(500).json({ error: "Erro interno do servidor"});
    }

});
/* POST - Cadastro de um novo cliente 
Recebe nome e email no corpo da requisição e valida os campos.
Insere o cliente no banco com saldo inicial 0.
Cadastro realizado o status é 201(Criado com sucesso).
Se erro, status 400
*/
app.post ('/clientes', async function(req,res) {
    const {nome, email} = req.body;

    if(!nome?.trim() || !email?.trim()){ 
        return res.status(400).json({ error: "Nome e email são obrigatórios"});
    }
    
    const emailLimpo = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailLimpo)) {
        return res.status(400).json ({error: "Email inválido"});
    }

    try{
        const result = await dbRun ('INSERT INTO clientes (nome, email, saldo) VALUES(?, ?, 0)', 
            [nome.trim(), emailLimpo]);
        return res.status(201).json ({ message: "Cliente cadastrado com sucesso", id: result.lastID});
     
    
    }catch (err) {
        if (err.message.includes("UNIQUE")) {
        return res.status(400).json ({ error: "Email já existe."}); 
        }
        return res.status(500).json ({error: "Erro interno do servidor"});
    }
});
/* PUT - UPDATE - Atualizar um cliente já existente.
Recebe id pela URL. Nome e email é pelo corpo.
Atualiza e retorna, Sucesso: o status 200(ok) e Erro: Status 400(Não entendeu)
Validação do ID: Uso do idNumber e Number.isInteger, se o id é número e se ele é um valor inteiro
Normalização do email: Uso do trim e LowerCase, remover espaços em branco e converte os caracteres para minúsculas
*/
app.put('/clientes/:id', async function(req, res) {
    try {
        const idNumber = validarId (req.params.id);
        let { nome, email } = req.body;

        if(!idNumber) {
            return res.status(400).json({ error: "ID inválido"});
        }

        // Validação Cliente existente
        const cliente = await dbGet('SELECT * FROM clientes WHERE id = ?', [idNumber]);

        if (!cliente) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }
        // Validação de campos
        if (!nome?.trim() || !email?.trim()) {
            return res.status(400).json({ error: "Nome e email são obrigatórios" });
        }
        // Normalização
        nome = nome.trim();
        email = email.trim().toLowerCase();

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Email inválido" });
        }

        // Email duplicado
        const emailEmUso = await dbGet(
            'SELECT * FROM clientes WHERE email = ? AND id != ?', [email, idNumber]
        );

        if (emailEmUso) {
            return res.status(400).json({ error: "Email já está em uso"});
        }

        // Atualização 
            await dbRun(
            'UPDATE clientes SET nome = ?, email = ? WHERE id = ?',[nome, email, idNumber]
        );
            return res.status(200).json({ message: "Cliente atualizado com sucesso" });

        } catch (err) {
             return res.status(500).json({error: "Erro interno do servidor"});
    }
});

/* DELETE - Deletar um cliente
Recebe id pela URL
Remove o cliente com base no id
Sucesso: o status 200(ok) e Erro: Status 400(Não entendeu)
*/
app.delete ('/clientes/:id', async function(req, res) {
    try{
    const idNumber = validarId(req.params.id);

    if(!idNumber){
        return res.status(400).json({error: "ID inválido"});
    }
    
        const result = await dbRun('DELETE FROM clientes WHERE id = ?', [idNumber]);

        if(result.changes === 0 ) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }
        return res.status(200).json({message: "Cliente removido com sucesso."});

    } catch(err){
        return res.status(500).json({error: "Erro interno do servidor"});
    }
    
});
/* POST - Depositar
Recebe e Valida o id do cliente pela URL 
Recebe o valor do depósito pelo corpo da requisição 
Valida se o valor é positivo (<= 0)
Validar se o Cliente existe/foi localizado
Sucesso: o status 200(ok) e Erro: "O valor deve ser positivo" 

*/
app.post('/clientes/:id/depositar', async function(req, res){
    try{
        const idNumber = validarId(req.params.id);
        const valorNumber = Number(req.body?.valor);

        if(!idNumber){
            return res.status(400).json({error: "ID inválido"});
        }
        if(!Number.isFinite(valorNumber) || valorNumber <=0){
            return res.status(400).json({error: "Valor inválido"});
        }

        const result = await dbRun('UPDATE clientes SET saldo = saldo + ? WHERE id = ?', [valorNumber,idNumber]);
       
        if (result.changes === 0) {
            return res.status(404).json({error: "Cliente não encontrado"});
        }
            return res.status(200).json({ message: "Depósito realizado com sucesso" });

    
    } catch (err) {
        return res.status(500).json({error: "Erro interno do servidor"});
    }
    
});
/* POST - Sacar - Realizar saque
Recebe o id do cliente pela URL e  o valor do saque pelo corpo da requisição 
Validar se o valor é positivo, se o cliente existe e se há saldo suficiente.
Subtrai o valor do saldo no banco
Sucesso: o status 200(ok) e Erro: "O valor deve ser positivo", "Cliente não encontrado", "Saldo insuficiente"
*/
app.post('/clientes/:id/sacar', async function(req, res) {
    try{
        const idNumber = validarId(req.params.id);
        const valorNumber = Number(req.body?.valor);

        if (!idNumber) {
            return res.status(400).json({ error: "ID inválido" });
        }

        if (!Number.isFinite(valorNumber) || valorNumber <= 0) {
            return res.status(400).json({ error: "Valor inválido" });
        }

        //busca o saldo do cliente no banco
        const cliente = await dbGet('SELECT saldo FROM clientes WHERE id = ?', [idNumber]);

        //Verifica se o cliente existe
        if(!cliente){ 
            return res.status(404).json({error: "Cliente não encontrado"});
        }
        //Verificar se tem saldo suficiente
        if (cliente.saldo < valorNumber) {
            return res.status(400).json({error: "Saldo insuficiente"});
        }
        //Atualizar o saldo subtraindo o valor
        await dbRun('UPDATE clientes SET saldo = saldo - ? WHERE id = ?', [valorNumber, idNumber]);
        return res.status(200).json({ message: "Saque realizado com sucesso" });

    } catch (err) {
        return res.status(500).json({error: "Erro interno do servidor"});
    }
});
/* LISTEN - Iniciar o servidor
Define a porta em que o servidor vai escutar requisições HTTP
Inicia o servidor e coloca a aplicação em estado de escuta (aguardando requisições)
Executa uma função de callback quando o servidor inicia com sucesso
Exibe no terminal a porta em uso
*/
app.listen (PORT, function() {
    console.log("Server Listening on PORT " + PORT);
});


