const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de requisições
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    next();
});

// ============================================================
// ARQUIVOS ESTÁTICOS (FRONTEND)
// ============================================================
app.use(express.static(path.join(__dirname, '../frontend')));

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
// ROTAS DE TESTE
// ============================================================
app.get('/api/test', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API do Automatic Correction está funcionando!',
        domain: process.env.SITE_URL || 'http://localhost:3000',
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
// ROTA PRINCIPAL
// ============================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
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
    console.log('🌐 AUTOMATIC CORRECTION');
    console.log('========================================');
    console.log(`📡 Site: http://localhost:${PORT}`);
    console.log(`🧪 API: http://localhost:${PORT}/api/test`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`📚 Turmas: http://localhost:${PORT}/api/turmas`);
    console.log('========================================');
    console.log('✅ Servidor pronto!');
    console.log('========================================');
});