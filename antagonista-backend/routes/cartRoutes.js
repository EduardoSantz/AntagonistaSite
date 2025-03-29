// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { getCartItems, addCartItem } = require('../controllers/cartController');

// Rota para obter itens do carrinho de um usuário
router.get('/:userId', getCartItems);

// Rota para adicionar item ao carrinho
router.post('/', addCartItem);

module.exports = router;
