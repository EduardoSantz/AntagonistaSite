// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
// Se estiver usando o carrinho, descomente a linha abaixo:
// const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes); // Ative se implementar o carrinho

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend com Prisma da Antagonista Merchstore funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
