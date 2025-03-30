// antagonista-backend/controllers/authController.js
const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Verifica se a variável de ambiente JWT_SECRET está definida
if (!process.env.JWT_SECRET) {
  console.error("A variável de ambiente JWT_SECRET não está definida.");
  process.exit(1);
}

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe.' });
    }

    // Cria o hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cria o novo usuário
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    return res.status(201).json({ message: 'Usuário registrado com sucesso!', user: newUser });
  } catch (error) {
    console.error('Erro em register:', error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Verifica a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gera o token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({ message: 'Login realizado com sucesso', token });
  } catch (error) {
    console.error('Erro em login:', error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

module.exports = { register, login };
