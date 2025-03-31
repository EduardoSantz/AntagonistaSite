import { prisma } from '../config/prismaClient.js';
import { hashedPassword } from './globalController.js';

export const createAdmin = async (req, res) => {
  const { nome, nomeExibicao, email, departamento, status, password } = req.body;

  if (!nome || !nomeExibicao || !email || !departamento || !status || !password) {
    return res.status(400).json({ error: true, message: 'Preencha os campos necessários' });
  }

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: true, message: 'E-mail já cadastrado.' });
    }
    const hashed = await hashedPassword(password);
    const newAdmin = await prisma.admin.create({
      data: {
        nome,
        nomeExibicao,
        email,
        departamento,
        status,
        password: hashed,
      },
    });

    return res.status(201).json({
      message: 'Admin cadastrado com sucesso',
      adminId: newAdmin.id,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany();
    if (!admins.length) {
      return res.status(404).json({ error: true, message: 'Nenhum administrador cadastrado' });
    }
    return res.status(200).json({ admins });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const getAdmin = async (req, res) => {
  const { adminId } = req.params;
  try {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      return res.status(404).json({ error: true, message: 'Administrador não encontrado' });
    }
    return res.status(200).json({ admin });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  const { adminId } = req.params;
  const { nome, nomeExibicao, email, departamento, status } = req.body;
  try {
    const existingAdmin = await prisma.admin.findFirst({
      where: { email, NOT: { id: adminId } },
    });
    if (existingAdmin) {
      return res.status(409).json({ error: true, message: 'E-mail já está em uso' });
    }
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: { nome, nomeExibicao, email, departamento, status },
    });
    return res.status(200).json({ message: 'Administrador atualizado', admin: updatedAdmin });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const updateAdminPassword = async (req, res) => {
  const { adminId } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: true, message: 'Senha não fornecida' });
  try {
    const hashed = await hashedPassword(password);
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashed },
    });
    return res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  const { adminId } = req.params;
  try {
    await prisma.admin.delete({ where: { id: adminId } });
    return res.status(200).json({ message: 'Administrador removido com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};
