const CartController = {
    getCart: async (req, res) => {
      try {
        const cart = await prisma.cart.findUnique({
          where: { userId: req.user.id },
          include: {
            items: {
              include: { product: true }
            }
          }
        });
        
        res.json(cart);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar carrinho' });
      }
    },
  
    addToCart: async (req, res) => {
      try {
        const { productId, quantity } = req.body;
        
        const cart = await prisma.cart.upsert({
          where: { userId: req.user.id },
          update: {
            items: {
              upsert: {
                where: { productId },
                create: { productId, quantity },
                update: { quantity: { increment: quantity } }
              }
            }
          },
          create: {
            userId: req.user.id,
            items: { create: { productId, quantity } }
          },
          include: { items: true }
        });
  
        res.json(cart);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar item' });
      }
    }
  };
  
  module.exports = CartController;