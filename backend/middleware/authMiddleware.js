const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { logSecurity } = require('../utils/logger');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logSecurity({
        action: 'authentication_failed',
        reason: 'no_token_provided',
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe y está activo
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      logSecurity({
        action: 'authentication_failed',
        reason: 'user_not_found_or_inactive',
        user_id: decoded.userId,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo'
      });
    }

    // Verificar si el usuario está bloqueado
    if (user.isLocked()) {
      logSecurity({
        action: 'authentication_failed',
        reason: 'user_locked',
        user_id: user.id,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        success: false,
        message: 'Usuario bloqueado temporalmente'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logSecurity({
      action: 'authentication_failed',
      reason: 'invalid_token',
      error: error.message,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    });
    
    return res.status(403).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      logSecurity({
        action: 'authorization_failed',
        reason: 'insufficient_permissions',
        user_id: req.user.id,
        required_roles: roles,
        user_role: req.user.role,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });
      
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware para verificar permisos específicos
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const rolePermissions = {
      admin: [
        'read_all', 'write_all', 'delete_all', 'manage_users', 
        'manage_system', 'view_reports', 'manage_incidents',
        'manage_devices', 'manage_customers'
      ],
      supervisor: [
        'read_all', 'write_incidents', 'assign_incidents',
        'view_reports', 'manage_team', 'escalate_incidents'
      ],
      technician: [
        'read_incidents', 'update_incidents', 'read_devices',
        'update_devices', 'create_incidents'
      ],
      analyst: [
        'read_all', 'view_reports', 'analyze_data',
        'create_reports'
      ],
      viewer: [
        'read_incidents', 'read_devices', 'read_customers'
      ]
    };

    const userPermissions = rolePermissions[req.user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      logSecurity({
        action: 'authorization_failed',
        reason: 'insufficient_permissions',
        user_id: req.user.id,
        required_permission: permission,
        user_role: req.user.role,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });
      
      return res.status(403).json({
        success: false,
        message: `Permiso requerido: ${permission}`
      });
    }

    next();
  };
};

// Middleware para verificar si el usuario puede acceder a un recurso específico
const canAccessResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Los administradores pueden acceder a todo
      if (userRole === 'admin') {
        return next();
      }

      // Lógica específica por tipo de recurso
      switch (resourceType) {
        case 'incident':
          const { Incident } = require('../models');
          const incident = await Incident.findByPk(resourceId);
          
          if (!incident) {
            return res.status(404).json({
              success: false,
              message: 'Incidencia no encontrada'
            });
          }

          // El creador o asignado puede acceder
          if (incident.created_by === userId || incident.assigned_to === userId) {
            return next();
          }

          // Supervisores pueden acceder a incidencias de su equipo
          if (userRole === 'supervisor') {
            return next();
          }

          break;

        case 'user':
          // Solo administradores y el propio usuario pueden acceder
          if (resourceId === userId || userRole === 'admin') {
            return next();
          }
          break;

        default:
          return next();
      }

      logSecurity({
        action: 'resource_access_denied',
        resource_type: resourceType,
        resource_id: resourceId,
        user_id: userId,
        user_role: userRole,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });

    } catch (error) {
      console.error('Error en canAccessResource:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware para rate limiting por usuario
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    } else {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);

    if (userRequests.length >= maxRequests) {
      logSecurity({
        action: 'rate_limit_exceeded',
        user_id: userId,
        requests_count: userRequests.length,
        max_requests: maxRequests,
        window_ms: windowMs,
        ip: req.ip
      });

      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
        retry_after: Math.ceil(windowMs / 1000)
      });
    }

    userRequests.push(now);
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  canAccessResource,
  userRateLimit
};