import { prisma } from '../config/prismaClient.js';

export const checkAccess = (...rolesRoutes) => {
  return async (req, res, next) => {
    const adminId = req.user.id;

    try {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        include: { role: { select: { nome: true } } },
      });

      if (!admin || !admin.role) {
        return res.status(403).json({
          error: true,
          message: 'Usuário não possui cargo válido'
        });
      }

      if (!rolesRoutes.includes(admin.role.nome)) {
        return res.status(403).json({
          error: true,
          message: 'Acesso negado para este cargo'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: 'Erro na verificação de acesso',
        details: error.message
      });
    }
  };
};
