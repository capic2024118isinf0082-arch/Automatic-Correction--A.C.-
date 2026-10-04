const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'A!23456789)(',
    database: process.env.DB_NAME || 'automatic_correction',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

const promisePool = pool.promise();

// Testar conexão
promisePool.getConnection()
    .then(conn => {
        console.log('✅ Conectado ao MySQL!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        console.log('⚠️ Verifique se o MySQL está rodando!');
    });

module.exports = {
    pool,
    promisePool,
    query: (sql, params) => promisePool.query(sql, params)
};