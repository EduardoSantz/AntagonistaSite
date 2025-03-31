import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
const router = express.Router();

const apiVersion = "/api/v1";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares globais
router.use(helmet());
router.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
router.use(morgan('combined'));
router.use(express.json({ limit: '10kb' }));

// Importação das rotas
import globalRoutes from "./routes/globalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authenticate from "./middlewares/authMiddleware.js";
import { authorize } from "./middlewares/authorize.js"; // Se necessário para funções administrativas

// Validação do Content-Type
router.use((req, res, next) => {
  if (req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
    return res.status(415).json({
      error: true,
      message: 'Formato de conteúdo não suportado'
    });
  }
  next();
});

// Health Check
router.get('/', (req, res) => res.status(200).json({
  status: 'operational',
  version: process.env.APP_VERSION,
  timestamp: new Date().toISOString()
}));

// Rotas públicas
router.use(`${apiVersion}/auth`, limiter, authRoutes);
router.use(`${apiVersion}/global`, globalRoutes);

// Rotas autenticadas
router.use(`${apiVersion}/users`, authenticate, userRoutes);

// Rotas administrativas
router.use(`${apiVersion}/admin`, authenticate, authorize(['Admin', 'Supervisor']), adminRoutes);

// Tratamento centralizado de erros
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Rota não encontrada
router.use('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: 'Endpoint não encontrado'
  });
});

export default router;
