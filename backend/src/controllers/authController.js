const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nome, sobrenome, email, senha, biografia, escola } = req.body;

        const existingUser = await Usuario.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'E-mail já cadastrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const userId = await Usuario.create({
            nome,
            sobrenome,
            email,
            senha: senhaHash,
            biografia,
            escola
        });

        const user = await Usuario.findById(userId);

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            token,
            user: {
                id: user.id,
                nome: user.nome,
                sobrenome: user.sobrenome,
                email: user.email,
                biografia: user.biografia,
                escola: user.escola
            }
        });

    } catch (error) {
        console.error('❌ Erro no registro:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const user = await Usuario.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        await Usuario.updateLastAccess(user.id);

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                nome: user.nome,
                sobrenome: user.sobrenome,
                email: user.email,
                biografia: user.biografia,
                escola: user.escola,
                foto_perfil: user.foto_perfil
            }
        });

    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ error: 'Erro ao realizar login' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await Usuario.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ user });

    } catch (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { nome, sobrenome, email, biografia, escola, foto_perfil } = req.body;

        const updated = await Usuario.update(userId, {
            nome,
            sobrenome,
            email,
            biografia,
            escola,
            foto_perfil
        });

        if (!updated) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = await Usuario.findById(userId);
        res.json({
            message: 'Perfil atualizado com sucesso',
            user
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};