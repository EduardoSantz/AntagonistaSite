import { prisma } from '../config/prismaClient.js';

export const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body; // itens: array de { productId, quantity }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: true, message: 'Itens do pedido são obrigatórios' });
  }
  try {
    let total = 0;
    const orderItemsData = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return res.status(400).json({ error: true, message: `Produto ${item.productId} não encontrado` });
      }
      const price = product.preco;
      total += price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
      });
    }
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'Pendente',
        items: { create: orderItemsData },
      },
      include: { items: true },
    });
    return res.status(201).json({ message: 'Pedido criado com sucesso', order });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro ao criar pedido', details: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro ao buscar pedidos', details: error.message });
  }
};

export const getOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) {
      return res.status(404).json({ error: true, message: 'Pedido não encontrado' });
    }
    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro ao buscar pedido', details: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  // Esta rota geralmente é exclusiva para administradores
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    return res.status(200).json({ message: 'Status do pedido atualizado', order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro ao atualizar pedido', details: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    await prisma.order.delete({ where: { id: orderId } });
    return res.status(200).json({ message: 'Pedido excluído com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro ao excluir pedido', details: error.message });
  }
};
