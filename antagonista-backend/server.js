import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fileUpload from 'express-fileupload';
import connectToDatabase from './database/conn.js';
import routes from './routes.js';
import { ENV } from './config/envValidator.js';
import adminRoleRoutes from './routes/adminRoleRoutes.js';
app.use('/adminRoles', adminRoleRoutes);

const server = express();

server.use(helmet());
server.use(cors({
  origin: ENV.CORS_ORIGINS.split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

server.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
server.use(express.json({ limit: '10kb' }));
server.use(express.urlencoded({ extended: true, limit: '10kb' }));

server.use(fileUpload({
  limits: { fileSize: ENV.MAX_FILE_SIZE * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: 'Tamanho do arquivo excedeu o limite permitido',
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: ENV.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Muitas requisições deste IP, tente novamente mais tarde'
  }
});

const startServer = async () => {
  try {
    await connectToDatabase();
    
    server.use('/api/v1', apiLimiter, routes);
    server.use('/uploads', express.static('back/uploads'));
    server.use(express.static('front', {
      extensions: ['html', 'htm'],
      setHeaders: (res) => {
        res.set('X-Content-Type-Options', 'nosniff')
      }
    }));

    server.get('/health', (req, res) => res.status(200).json({
      status: 'OK',
      version: ENV.APP_VERSION,
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString()
    }));

    server.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(err.statusCode || 500).json({
        error: true,
        message: ENV.NODE_ENV === 'production' 
          ? 'Erro interno do servidor' 
          : err.message
      });
    });

    server.use('*', (req, res) => {
      res.status(404).sendFile('front/404.html', { root: '.' });
    });

    server.listen(ENV.PORT, () => {
      console.log(`🚀 Servidor ${ENV.APP_NAME} rodando na porta ${ENV.PORT}`);
      console.log(`Ambiente: ${ENV.NODE_ENV}`);
      console.log(`Origins permitidos: ${ENV.CORS_ORIGINS}`);
    });

  } catch (error) {
    console.error('❌ Falha na inicialização:', error);
    process.exit(1);
  }
};

startServer();
