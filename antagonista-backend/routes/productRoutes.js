// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct } = require('../controllers/productController');

// Endpoint para listar produtos
router.get('/', getProducts);

// Endpoint para obter detalhes de um produto pelo ID
router.get('/:id', getProductById);

// Endpoint para criar um novo produto
// (Para produção, recomenda-se restringir este endpoint a usuários administradores)
router.post('/', createProduct);

module.exports = router;
