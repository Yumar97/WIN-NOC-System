const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const logger = require('./utils/logger');
const db = require('./models');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { authenticateToken } = require('./middleware/authMiddleware');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo
  message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.'
});

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(compression());
app.use(limiter);
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de Socket.IO para tiempo real
io.on('connection', (socket) => {
  logger.info(`Cliente conectado: ${socket.id}`);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    logger.info(`Cliente ${socket.id} se unió a la sala: ${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});

// Hacer io disponible en toda la aplicación
app.set('io', io);

// Rutas de salud del sistema
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas principales de la API
app.use('/api/auth', routes.auth);
app.use('/api/dashboard', authenticateToken, routes.dashboard);
app.use('/api/incidents', authenticateToken, routes.incidents);
app.use('/api/network', authenticateToken, routes.network);
app.use('/api/analytics', authenticateToken, routes.analytics);
app.use('/api/customers', authenticateToken, routes.customers);
app.use('/api/reports', authenticateToken, routes.reports);
app.use('/api/users', authenticateToken, routes.users);
app.use('/api/notifications', authenticateToken, routes.notifications);

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    await db.sequelize.authenticate();
    logger.info('Conexión a la base de datos establecida correctamente.');
    
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('Modelos de base de datos sincronizados.');
    }
  } catch (error) {
    logger.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// Función para iniciar el servidor
async function startServer() {
  try {
    await initializeDatabase();
    
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor WIN NOC ejecutándose en puerto ${PORT}`);
      logger.info(`📊 Dashboard disponible en: http://localhost:${PORT}/health`);
      logger.info(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales del sistema
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor gracefully...');
  server.close(() => {
    logger.info('Servidor cerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Cerrando servidor gracefully...');
  server.close(() => {
    logger.info('Servidor cerrado.');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar el servidor
startServer();

module.exports = app;