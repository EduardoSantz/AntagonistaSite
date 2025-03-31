import { prisma } from '../config/prismaClient.js';

export const createAddress = async (req, res) => {
  const userId = req.user.id;
  const { street, city, state, zip, country, isDefault } = req.body;
  if (!street || !city || !state || !zip || !country) {
    return res.status(400).json({ error: true, message: 'Campos obrigatórios não preenchidos' });
  }
  try {
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const newAddress = await prisma.address.create({
      data: {
        userId,
        street,
        city,
        state,
        zip,
        country,
        isDefault: isDefault || false,
      },
    });
    return res.status(201).json({ message: 'Endereço criado com sucesso', address: newAddress });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const getAddresses = async (req, res) => {
  const userId = req.user.id;
  try {
    const addresses = await prisma.address.findMany({ where: { userId } });
    return res.status(200).json({ addresses });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const getAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  try {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      return res.status(404).json({ error: true, message: 'Endereço não encontrado' });
    }
    return res.status(200).json({ address });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const updateAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  const { street, city, state, zip, country, isDefault } = req.body;
  if (!street || !city || !state || !zip || !country) {
    return res.status(400).json({ error: true, message: 'Campos obrigatórios não preenchidos' });
  }
  try {
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { street, city, state, zip, country, isDefault: isDefault || false },
    });
    return res.status(200).json({ message: 'Endereço atualizado com sucesso', address: updatedAddress });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  const { addressId } = req.params;
  try {
    await prisma.address.delete({ where: { id: addressId } });
    return res.status(200).json({ message: 'Endereço excluído com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const getDefaultAddress = async (req, res) => {
  const userId = req.user.id;
  try {
    const address = await prisma.address.findFirst({ where: { userId, isDefault: true } });
    return res.status(200).json({ address });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  try {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
    return res.status(200).json({ message: 'Endereço padrão definido', address: updatedAddress });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};
