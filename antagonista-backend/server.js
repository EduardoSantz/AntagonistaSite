// server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

// Rotas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== Configurações Iniciais ====================
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://antagonista-site.vercel.app' 
    : [
        'http://localhost:3000',
        'http://localhost:5000'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Configuração de Sessão ====================
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true, // Alterado para true em desenvolvimento
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// ==================== Autenticação ====================
app.use(passport.initialize());
app.use(passport.session());

// Middleware de autenticação JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = decoded;
    next();
  });
};

// ==================== Rotas ====================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', verifyToken, cartRoutes);

// ==================== Pagamento com Stripe ====================
app.post('/api/payment', verifyToken, async (req, res) => {
  try {
    const { amount, paymentMethodId, currency = 'brl' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Converter para centavos
      currency,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
    
  } catch (error) {
    console.error('Erro no pagamento:', error);
    res.status(500).json({ 
      error: 'Erro ao processar pagamento',
      details: error.message 
    });
  }
});

// ==================== Health Check ====================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ==================== Tratamento de Erros ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const response = {
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Erro interno do servidor'
    }
  };

  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  res.status(err.status || 500).json(response);
});

// ==================== Inicialização do Servidor ====================
app.listen(PORT, () => {
  console.log(`
  ====================================
   🚀 Servidor rodando na porta ${PORT}
   Ambiente: ${process.env.NODE_ENV || 'development'}
   URL: http://localhost:${PORT}
  ====================================
  `);
});