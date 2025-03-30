// antagonista-backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { getCartItems, addCartItem } = require('../controllers/cartController');

router.get('/:userId', getCartItems);
router.post('/', addCartItem);

module.exports = router;
