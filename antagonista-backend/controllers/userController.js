import { prisma } from '../config/prismaClient.js';
import { decoder, displayUser, hashedPassword } from './globalController.js';

export const getUser = async (req, res) => {
  const token = decoder(req.headers.authorization);

  try {
    const user = await prisma.user.findUnique({
      where: { id: token.id }
    });

    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuário não encontrado' });
    }

    return res.status(200).json({ user: displayUser(user) });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar usuário',
      details: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  const token = decoder(req.headers.authorization);
  const { cpf, name, birthdate, tel, email } = req.body;

  if (!cpf || !name || !birthdate || !email) {
    return res.status(400).json({ error: true, message: 'Campos obrigatórios não preenchidos' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ cpf }, { email }],
        NOT: { id: token.id }
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: true, message: 'CPF ou e-mail já cadastrados' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: token.id },
      data: {
        name,
        cpf,
        birthdate: new Date(birthdate),
        tel,
        email
      }
    });

    return res.status(200).json({
      message: 'Dados atualizados com sucesso',
      user: displayUser(updatedUser)
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao atualizar usuário',
      details: error.message
    });
  }
};

export const updatePassword = async (req, res) => {
  const token = decoder(req.headers.authorization);
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: true, message: 'Senha não fornecida' });
  }

  try {
    const hashedPwd = await hashedPassword(password);

    await prisma.user.update({
      where: { id: token.id },
      data: { password: hashedPwd }
    });

    return res.status(200).json({ message: 'Senha atualizada com sucesso' });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao atualizar senha',
      details: error.message
    });
  }
};
