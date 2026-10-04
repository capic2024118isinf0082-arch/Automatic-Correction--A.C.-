const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
    name: 'Automatic Correction',
    description: 'Servidor do Sistema Automatic Correction',
    script: path.join(__dirname, 'server.js'),
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
});

// Instalar o serviço
svc.on('install', function() {
    console.log('✅ Serviço instalado com sucesso!');
    console.log('🚀 Iniciando serviço...');
    svc.start();
});

svc.on('start', function() {
    console.log('✅ Serviço iniciado!');
    console.log('📡 Acesse: http://localhost:3000');
});

svc.on('error', function(err) {
    console.error('❌ Erro:', err);
});

// Executar instalação
svc.install();