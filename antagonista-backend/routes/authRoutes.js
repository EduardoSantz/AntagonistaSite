// antagonista-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const passport = require('passport');

// Autenticação local
router.post('/register', register);
router.post('/login', login);

// Autenticação via Google
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth-success?token=${req.user.token}`);
    }
  );

module.exports = router;
