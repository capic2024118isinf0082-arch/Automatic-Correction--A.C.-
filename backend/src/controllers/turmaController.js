const Turma = require('../models/Turma');
const Aluno = require('../models/Aluno');

// ============================================================
// LISTAR TURMAS (com filtros e busca)
// ============================================================
exports.listar = async (req, res) => {
    try {
        const { busca, status, nivel, ordenar } = req.query;
        
        let turmas = await Turma.findByUsuarioId(req.userId);
        
        // Aplicar filtros
        if (busca) {
            const termo = busca.toLowerCase();
            turmas = turmas.filter(t => 
                t.nome.toLowerCase().includes(termo) ||
                t.nivel.toLowerCase().includes(termo)
            );
        }
        
        if (status && status !== 'todos') {
            turmas = turmas.filter(t => t.status === status);
        }
        
        if (nivel && nivel !== 'todos') {
            turmas = turmas.filter(t => t.nivel === nivel);
        }
        
        // Ordenação
        if (ordenar) {
            switch (ordenar) {
                case 'nome':
                    turmas.sort((a, b) => a.nome.localeCompare(b.nome));
                    break;
                case 'media':
                    turmas.sort((a, b) => b.media_calculada - a.media_calculada);
                    break;
                case 'alunos':
                    turmas.sort((a, b) => b.total_alunos - a.total_alunos);
                    break;
                case 'recente':
                    turmas.sort((a, b) => new Date(b.data_atualizacao) - new Date(a.data_atualizacao));
                    break;
                default:
                    break;
            }
        }
        
        res.json({ 
            turmas,
            total: turmas.length,
            estatisticas: {
                totalTurmas: turmas.length,
                totalAlunos: turmas.reduce((acc, t) => acc + parseInt(t.total_alunos || 0), 0),
                mediaGeral: turmas.length > 0 
                    ? (turmas.reduce((acc, t) => acc + parseFloat(t.media_calculada || 0), 0) / turmas.length).toFixed(1)
                    : 0
            }
        });

    } catch (error) {
        console.error('❌ Erro ao listar turmas:', error);
        res.status(500).json({ error: 'Erro ao listar turmas' });
    }
};

// ============================================================
// CRIAR TURMA
// ============================================================
exports.criar = async (req, res) => {
    try {
        const { nome, nivel, status, total_aulas, tags } = req.body;

        // Validar dados
        if (!nome || nome.trim() === '') {
            return res.status(400).json({ error: 'Nome da turma é obrigatório' });
        }

        const turmaId = await Turma.create({
            usuario_id: req.userId,
            nome: nome.trim(),
            nivel: nivel || 'Ensino Básico',
            status: status || 'success',
            total_aulas: total_aulas || 0
        });

        const turma = await Turma.findById(turmaId);
        res.status(201).json({
            message: 'Turma criada com sucesso',
            turma
        });

    } catch (error) {
        console.error('❌ Erro ao criar turma:', error);
        res.status(500).json({ error: 'Erro ao criar turma' });
    }
};

// ============================================================
// BUSCAR TURMA
// ============================================================
exports.buscar = async (req, res) => {
    try {
        const { id } = req.params;
        
        const turma = await Turma.findById(id);
        
        if (!turma) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        if (turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const alunos = await Aluno.findByTurmaId(id);
        const stats = await Turma.getStatistics(id);

        // Calcular informações extras
        const distribuicao = {
            excelente: alunos.filter(a => a.gpa >= 8).length,
            bom: alunos.filter(a => a.gpa >= 6 && a.gpa < 8).length,
            regular: alunos.filter(a => a.gpa >= 4 && a.gpa < 6).length,
            ruim: alunos.filter(a => a.gpa < 4).length
        };

        res.json({
            turma,
            alunos,
            statistics: stats,
            distribuicao
        });

    } catch (error) {
        console.error('❌ Erro ao buscar turma:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar turma',
            message: error.message 
        });
    }
};

// ============================================================
// ATUALIZAR TURMA
// ============================================================
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, nivel, status, total_aulas } = req.body;

        const turma = await Turma.findById(id);
        if (!turma) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        if (turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const updated = await Turma.update(id, { nome, nivel, status, total_aulas });
        if (!updated) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        const turmaAtualizada = await Turma.findById(id);
        res.json({
            message: 'Turma atualizada com sucesso',
            turma: turmaAtualizada
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar turma:', error);
        res.status(500).json({ error: 'Erro ao atualizar turma' });
    }
};

// ============================================================
// DELETAR TURMA
// ============================================================
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;

        const turma = await Turma.findById(id);
        if (!turma) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        if (turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await Turma.delete(id);
        res.json({ message: 'Turma removida com sucesso' });

    } catch (error) {
        console.error('❌ Erro ao deletar turma:', error);
        res.status(500).json({ error: 'Erro ao deletar turma' });
    }
};

// ============================================================
// DUPLICAR TURMA
// ============================================================
exports.duplicar = async (req, res) => {
    try {
        const { id } = req.params;
        
        const turmaOriginal = await Turma.findById(id);
        if (!turmaOriginal) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        if (turmaOriginal.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const novaTurmaId = await Turma.create({
            usuario_id: req.userId,
            nome: `${turmaOriginal.nome} (Cópia)`,
            nivel: turmaOriginal.nivel,
            status: turmaOriginal.status,
            total_aulas: 0
        });

        const novaTurma = await Turma.findById(novaTurmaId);
        res.status(201).json({
            message: 'Turma duplicada com sucesso',
            turma: novaTurma
        });

    } catch (error) {
        console.error('❌ Erro ao duplicar turma:', error);
        res.status(500).json({ error: 'Erro ao duplicar turma' });
    }
};

// ============================================================
// EXPORTAR TURMAS
// ============================================================
exports.exportar = async (req, res) => {
    try {
        const turmas = await Turma.findByUsuarioId(req.userId);
        
        let conteudo = '========================================\n';
        conteudo += 'RELATÓRIO DE TURMAS - AUTOMATIC CORRECTION\n';
        conteudo += '========================================\n\n';
        conteudo += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
        conteudo += `Total de Turmas: ${turmas.length}\n\n`;
        
        turmas.forEach((t, i) => {
            conteudo += `----------------------------------------\n`;
            conteudo += `TURMA ${i + 1}: ${t.nome}\n`;
            conteudo += `----------------------------------------\n`;
            conteudo += `Nível: ${t.nivel}\n`;
            conteudo += `Status: ${t.status}\n`;
            conteudo += `Total de Alunos: ${t.total_alunos || 0}\n`;
            conteudo += `Média Geral: ${(t.media_calculada || 0).toFixed(1)}\n`;
            conteudo += `Total de Aulas: ${t.total_aulas || 0}\n`;
            conteudo += `Última Atualização: ${new Date(t.data_atualizacao).toLocaleString('pt-BR')}\n\n`;
        });
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-turmas.txt');
        res.send(conteudo);

    } catch (error) {
        console.error('❌ Erro ao exportar turmas:', error);
        res.status(500).json({ error: 'Erro ao exportar turmas' });
    }
};