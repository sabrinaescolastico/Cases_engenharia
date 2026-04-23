async function depositar(dbRun, idNumber, valorNumber) {
    const result = await dbRun(
        'UPDATE clientes SET saldo = saldo + ? WHERE id = ?',
        [valorNumber, idNumber]
    );

    if (result.changes === 0) {
        throw new Error("CLIENTE_NAO_ENCONTRADO");
    }
}

async function sacar(dbRun, idNumber, valorNumber) {
    const result = await dbRun(
        'UPDATE clientes SET saldo = saldo - ? WHERE id = ? AND saldo >= ?',
        [valorNumber, idNumber, valorNumber]
    );

    if (result.changes === 0) {
        throw new Error("SALDO_INSUFICIENTE_OU_CLIENTE_NAO_ENCONTRADO");
    }
}

module.exports = {
    depositar,
    sacar
};