const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// CONFIGURAÇÃO DE AMBIENTE E DOMÍNIOS
// ============================================================
const DOMAIN = process.env.SITE_URL || 'https://automatic-correction-t5h6.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://automaticcorrection.netlify.app';

console.log(`🌐 Backend rodando no Render`);
console.log(`🔗 API URL: ${DOMAIN}`);
console.log(`🖥️  Frontend permitido: ${FRONTEND_URL}`);

// ============================================================
// MIDDLEWARE CORS (CORRIGIDO PARA NETLIFY)
// ============================================================
// O CORS precisa permitir que o Netlify faça requisições.
// Usamos uma função para ter controle total sobre quem é liberado.
app.use(cors({
    origin: function (origin, callback) {
        // Lista de domínios permitidos
        const allowedOrigins = [
            FRONTEND_URL,
            'https://automaticcorrection.netlify.app', // Seu link do Netlify
            'https://automatic-correction-t5h6.onrender.com', // Seu link do Render
            'http://localhost:3000', // Para testes locais
            'http://localhost:5500',
            'http://127.0.0.1:5500'
        ];

        // Permite requisições sem 'origin' (como apps mobile ou Postman)
        if (!origin) return callback(null, true);

        // Se a origem estiver na lista, permite
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`🚫 CORS bloqueado para a origem: ${origin}`);
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// ============================================================
// OUTROS MIDDLEWARES
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de requisições (útil para debug no Render)
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url} - Origem: ${req.headers.origin || 'Desconhecida'}`);
    next();
});

// ============================================================
// ROTAS DA API
// ============================================================
const authRoutes = require('./src/routes/authRoutes');
const turmaRoutes = require('./src/routes/turmaRoutes');
const alunoRoutes = require('./src/routes/alunoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/alunos', alunoRoutes);

// ============================================================
// ROTAS DE TESTE E HEALTH CHECK
// ============================================================
app.get('/api/test', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API do Automatic Correction está funcionando!',
        domain: DOMAIN,
        frontend: FRONTEND_URL,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor rodando!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============================================================
// TRATAMENTO DE ERROS
// ============================================================
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: err.message 
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('🚀 AUTOMATIC CORRECTION - BACKEND');
    console.log('========================================');
    console.log(`📡 Rodando na porta: ${PORT}`);
    console.log(`🌐 URL do Site: ${DOMAIN}`);
    console.log(`🧪 Teste API: ${DOMAIN}/api/test`);
    console.log('========================================');
    console.log('✅ Servidor pronto para receber requisições!');
});