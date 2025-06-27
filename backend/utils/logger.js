const winston = require('winston');
const path = require('path');

// Configuración de formatos personalizados
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Configuración de formatos para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Crear directorio de logs si no existe
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuración del logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'win-noc-backend' },
  transports: [
    // Archivo para errores
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Archivo para todos los logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Archivo específico para incidencias
    new winston.transports.File({
      filename: path.join(logDir, 'incidents.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // Archivo para auditoría de seguridad
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  ],
});

// En desarrollo, también log a consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Funciones de utilidad para logging específico
const logIncident = (incidentData) => {
  logger.info('INCIDENT_EVENT', {
    type: 'incident',
    ...incidentData,
    timestamp: new Date().toISOString()
  });
};

const logSecurity = (securityEvent) => {
  logger.warn('SECURITY_EVENT', {
    type: 'security',
    ...securityEvent,
    timestamp: new Date().toISOString()
  });
};

const logPerformance = (performanceData) => {
  logger.info('PERFORMANCE_METRIC', {
    type: 'performance',
    ...performanceData,
    timestamp: new Date().toISOString()
  });
};

const logUserAction = (userId, action, details = {}) => {
  logger.info('USER_ACTION', {
    type: 'user_action',
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

const logSystemHealth = (healthData) => {
  logger.info('SYSTEM_HEALTH', {
    type: 'system_health',
    ...healthData,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  logIncident,
  logSecurity,
  logPerformance,
  logUserAction,
  logSystemHealth
};