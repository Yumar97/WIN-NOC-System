const { logger } = require('../utils/logger');

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware principal de manejo de errores
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let details = {};

  // Log del error
  logger.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous',
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Errores específicos de Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Error de validación';
    details = {
      type: 'validation_error',
      fields: err.errors.map(error => ({
        field: error.path,
        message: error.message,
        value: error.value
      }))
    };
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Conflicto: El recurso ya existe';
    details = {
      type: 'unique_constraint_error',
      fields: err.errors.map(error => ({
        field: error.path,
        message: `${error.path} ya está en uso`,
        value: error.value
      }))
    };
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Error de referencia: Recurso relacionado no encontrado';
    details = {
      type: 'foreign_key_error',
      constraint: err.parent.constraint
    };
  } else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    message = 'Error de base de datos';
    details = {
      type: 'database_error',
      sql_message: process.env.NODE_ENV === 'development' ? err.parent.message : undefined
    };
  }

  // Errores de JWT
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
    details = {
      type: 'jwt_error'
    };
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
    details = {
      type: 'jwt_expired',
      expired_at: err.expiredAt
    };
  }

  // Errores de validación de Joi
  else if (err.isJoi) {
    statusCode = 400;
    message = 'Error de validación de datos';
    details = {
      type: 'joi_validation_error',
      fields: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }))
    };
  }

  // Errores de multer (subida de archivos)
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'Archivo demasiado grande';
    details = {
      type: 'file_size_error',
      limit: err.limit
    };
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 413;
    message = 'Demasiados archivos';
    details = {
      type: 'file_count_error',
      limit: err.limit
    };
  }

  // Errores de conexión de red
  else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Servicio no disponible';
    details = {
      type: 'connection_error',
      service: 'database'
    };
  } else if (err.code === 'ETIMEDOUT') {
    statusCode = 504;
    message = 'Tiempo de espera agotado';
    details = {
      type: 'timeout_error'
    };
  }

  // Errores personalizados de la aplicación
  else if (err.type === 'BUSINESS_LOGIC_ERROR') {
    statusCode = 422;
    message = err.message;
    details = {
      type: 'business_logic_error',
      code: err.code
    };
  } else if (err.type === 'RESOURCE_NOT_FOUND') {
    statusCode = 404;
    message = err.message || 'Recurso no encontrado';
    details = {
      type: 'resource_not_found',
      resource: err.resource
    };
  } else if (err.type === 'PERMISSION_DENIED') {
    statusCode = 403;
    message = err.message || 'Permisos insuficientes';
    details = {
      type: 'permission_denied',
      required_permission: err.permission
    };
  }

  // Respuesta de error
  const errorResponse = {
    success: false,
    message,
    ...(Object.keys(details).length > 0 && { details }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      original_error: err.name
    }),
    timestamp: new Date().toISOString(),
    request_id: req.id || 'unknown'
  };

  res.status(statusCode).json(errorResponse);
};

// Middleware para validar esquemas de Joi
const validateSchema = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const validationError = new Error('Error de validación');
      validationError.isJoi = true;
      validationError.details = error.details;
      return next(validationError);
    }

    // Reemplazar los datos validados y sanitizados
    req[property] = value;
    next();
  };
};

// Middleware para capturar errores asíncronos
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Función para crear errores personalizados
const createError = (message, statusCode = 500, type = null, details = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.type = type;
  Object.assign(error, details);
  return error;
};

// Función para crear error de recurso no encontrado
const createNotFoundError = (resource = 'Recurso') => {
  return createError(
    `${resource} no encontrado`,
    404,
    'RESOURCE_NOT_FOUND',
    { resource }
  );
};

// Función para crear error de lógica de negocio
const createBusinessLogicError = (message, code = null) => {
  return createError(
    message,
    422,
    'BUSINESS_LOGIC_ERROR',
    { code }
  );
};

// Función para crear error de permisos
const createPermissionError = (permission = null) => {
  return createError(
    'No tienes permisos para realizar esta acción',
    403,
    'PERMISSION_DENIED',
    { permission }
  );
};

module.exports = {
  notFound,
  errorHandler,
  validateSchema,
  asyncHandler,
  createError,
  createNotFoundError,
  createBusinessLogicError,
  createPermissionError
};