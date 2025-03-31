import { prisma } from '../config/prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { hashedPassword, generateToken } from './globalController.js';

// Registro de usuário (clientes)
export const registerUser = async (req, res) => {
  const { cpf, name, birthdate, tel, email, password } = req.body;

  if (!cpf || !name || !birthdate || !email || !password) {
    return res.status(400).json({ error: true, message: 'Preencha os campos necessários' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ cpf }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: true, message: 'CPF ou e-mail já existem.' });
    }

    const hashed = await hashedPassword(password);
    
    const newUser = await prisma.user.create({
      data: {
        cpf,
        name,
        email,
        tel,
        birthdate: new Date(birthdate),
        password: hashed
      }
    });

    return res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: newUser.id });

  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

// Login de usuário
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: 'Preencha os campos necessários' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: true, message: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: true, message: 'Credenciais inválidas' });
    }

    return res.status(200).json({ token: generateToken(user) });

  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

// Login de administrador
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: 'Preencha os campos necessários' });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.status(400).json({ error: true, message: 'Credenciais inválidas' });
    }

    if (admin.status === 'inativo') {
      return res.status(401).json({ error: true, message: 'Usuário inativo' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: true, message: 'Credenciais inválidas' });
    }

    return res.status(200).json({ token: generateToken(admin) });

  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};
