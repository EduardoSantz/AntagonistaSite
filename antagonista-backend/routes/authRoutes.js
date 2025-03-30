const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const passport = require('passport');

// Autenticação local
router.post('/register', register);
router.post('/login', login);

// Inicia a autenticação via Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Rota de callback após a autenticação com o Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
    session: false,
  }),
  (req, res) => {
    // Após o callback, redireciona para o frontend com o token gerado
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth-success?token=${req.user.token}`);
  }
);

module.exports = router;
