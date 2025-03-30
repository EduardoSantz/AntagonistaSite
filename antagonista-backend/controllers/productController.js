// controllers/productController.js
const prisma = require('../config/prismaClient');

// Retorna todos os produtos
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
};

// Retorna um produto por ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error('Erro ao buscar o produto:', error);
    return res.status(500).json({ message: 'Erro ao buscar o produto' });
  }
};

// Cria um novo produto
const createProduct = async (req, res) => {
  const { name, price, description, imageUrl, category } = req.body;

  // Verificação básica dos campos obrigatórios
  if (!name || !price || !imageUrl) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes (name, price, imageUrl)' });
  }

  try {
    const product = await prisma.product.create({
      data: { name, price, description, imageUrl, category }
    });
    return res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

module.exports = { getProducts, getProductById, createProduct };
