/**
 * FISCAL WEB NEXT - FILIAL API (EXEMPLO NODE.JS)
 * Este script deve rodar no servidor local de cada filial que possui o MySQL.
 */

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 3001; // Cada filial pode escolher sua porta

// Configuração do MySQL Local da Filial
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fiscal_local'
};

app.get('/health', (req, res) => res.json({ status: 'online' }));

// Busca notas autorizadas
app.get('/nfce/autorizadas', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM nfc_autorizadas WHERE data_emissao >= ?', [req.query.desde || '2000-01-01']);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Busca XML por chave
app.get('/xml/:chave', async (req, res) => {
    // Lógica para ler arquivo do disco e retornar
    res.send('<xml>...</xml>');
});

app.listen(port, () => console.log(`Branch API running at http://localhost:${port}`));
