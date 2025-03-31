import { prisma } from '../config/prismaClient.js';

export const createCategory = async (req, res) => {
  const { nome, descricao } = req.body;
  if (!nome) {
    return res.status(400).json({ error: true, message: 'Nome da categoria é obrigatório' });
  }
  try {
    const existingCategory = await prisma.category.findFirst({ where: { nome } });
    if (existingCategory) {
      return res.status(409).json({ error: true, message: 'Categoria já cadastrada' });
    }
    const newCategory = await prisma.category.create({
      data: { nome, descricao },
    });
    return res.status(201).json({ message: 'Categoria cadastrada com sucesso', categoria: newCategory });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    return res.status(200).json({ categorias: categories });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const getCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ error: true, message: 'Categoria não encontrada' });
    }
    return res.status(200).json({ categoria: category });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { nome, descricao } = req.body;
  if (!nome || !descricao) {
    return res.status(400).json({ error: true, message: 'Todos os campos são obrigatórios' });
  }
  try {
    const existingCategory = await prisma.category.findFirst({
      where: { nome, NOT: { id: categoryId } },
    });
    if (existingCategory) {
      return res.status(409).json({ error: true, message: 'Nome já está em uso por outra categoria' });
    }
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { nome, descricao },
    });
    return res.status(200).json({ message: 'Categoria atualizada com sucesso', categoria: updatedCategory });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    await prisma.category.delete({ where: { id: categoryId } });
    return res.status(200).json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};
