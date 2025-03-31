import { prisma } from '../config/prismaClient.js';

export const assignRoleToAdmin = async (req, res) => {
  const { admin_id, roleName } = req.body;
  try {
    const [admin, role] = await Promise.all([
      prisma.admin.findUnique({ where: { id: admin_id } }),
      prisma.role.findFirst({ where: { nome: roleName } }),
    ]);

    if (!admin || !role) {
      return res.status(404).json({ error: true, message: 'Admin ou cargo não encontrado' });
    }

    const existingRole = await prisma.adminRole.findFirst({
      where: { adminId: admin_id },
    });

    if (existingRole) {
      return res.status(409).json({ error: true, message: 'Admin já possui um cargo atribuído' });
    }

    const newAdminRole = await prisma.adminRole.create({
      data: {
        adminId: admin_id,
        roleId: role.id,
      },
    });

    return res.status(201).json({ message: 'Cargo atribuído com sucesso', adminRole: newAdminRole });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const getAdminRoles = async (req, res) => {
  try {
    const adminRoles = await prisma.adminRole.findMany({
      include: { admin: true, role: true },
    });
    if (adminRoles.length === 0) {
      return res.status(404).json({ error: true, message: 'Nenhum cargo cadastrado' });
    }
    return res.status(200).json({ adminRoles });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const getAdminWithRole = async (req, res) => {
  const { adminId } = req.params;
  try {
    const adminWithRole = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { adminRole: { include: { role: true } } },
    });
    if (!adminWithRole) {
      return res.status(404).json({ error: true, message: 'Admin não encontrado' });
    }
    const formattedResult = {
      id: adminWithRole.id,
      nome: adminWithRole.nome,
      email: adminWithRole.email,
      cargo: adminWithRole.adminRole?.role?.nome || 'Sem cargo',
    };
    return res.status(200).json({ admin: formattedResult });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const updateAdminRole = async (req, res) => {
  const { adminId } = req.params;
  const { cargo } = req.body;
  try {
    const role = await prisma.role.findFirst({ where: { nome: cargo } });
    if (!role) {
      return res.status(404).json({ error: true, message: 'Cargo não encontrado' });
    }
    const existingAdminRole = await prisma.adminRole.findFirst({ where: { adminId } });
    let result;
    if (existingAdminRole) {
      result = await prisma.adminRole.update({
        where: { id: existingAdminRole.id },
        data: { roleId: role.id },
      });
    } else {
      result = await prisma.adminRole.create({
        data: { adminId, roleId: role.id },
      });
    }
    return res.status(200).json({ message: 'Cargo atualizado com sucesso', adminRole: result });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};

export const removeAdminRole = async (req, res) => {
  const { adminId } = req.params;
  try {
    const adminRole = await prisma.adminRole.findFirst({ where: { adminId } });
    if (!adminRole) {
      return res.status(404).json({ error: true, message: 'Cargo não encontrado para este admin' });
    }
    await prisma.adminRole.delete({ where: { id: adminRole.id } });
    return res.status(200).json({ message: 'Cargo removido com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro no servidor', details: error.message });
  }
};
