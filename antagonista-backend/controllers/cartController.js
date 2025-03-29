// controllers/cartController.js
const prisma = require('../config/prismaClient');

// Obter itens do carrinho de um usuário
const getCartItems = async (req, res) => {
  const { userId } = req.params;
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: Number(userId) },
      include: {
        product: true,
      },
    });
    res.status(200).json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar itens do carrinho' });
  }
};

// Adicionar item ao carrinho
const addCartItem = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
    });
    res.status(201).json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao adicionar item ao carrinho' });
  }
};

module.exports = { getCartItems, addCartItem };
