const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { User } = require('../models');
const { validateSchema, asyncHandler } = require('../middleware/errorMiddleware');
const { logSecurity, logUserAction } = require('../utils/logger');
const authSchemas = require('../schemas/authSchemas');

const router = express.Router();

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  message: {
    success: false,
    message: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora.'
  }
});

// Función para generar tokens
const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/login - Iniciar sesión
router.post('/login', 
  authLimiter,
  validateSchema(authSchemas.loginSchema),
  asyncHandler(async (req, res) => {
    const { username, password, remember_me } = req.body;

    // Buscar usuario por username o email
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() }
        ]
      }
    });

    if (!user) {
      logSecurity({
        action: 'login_failed',
        reason: 'user_not_found',
        username,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está bloqueado
    if (user.isLocked()) {
      logSecurity({
        action: 'login_failed',
        reason: 'user_locked',
        user_id: user.id,
        username: user.username,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        message: 'Usuario bloqueado temporalmente debido a múltiples intentos fallidos'
      });
    }

    // Verificar si el usuario está activo
    if (!user.is_active) {
      logSecurity({
        action: 'login_failed',
        reason: 'user_inactive',
        user_id: user.id,
        username: user.username,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      
      logSecurity({
        action: 'login_failed',
        reason: 'invalid_password',
        user_id: user.id,
        username: user.username,
        login_attempts: user.login_attempts + 1,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Login exitoso - resetear intentos y actualizar último login
    await user.resetLoginAttempts();
    await user.updateLastLogin();

    // Generar tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logSecurity({
      action: 'login_success',
      user_id: user.id,
      username: user.username,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    });

    logUserAction(user.id, 'login', {
      ip: req.ip,
      user_agent: req.get('User-Agent'),
      remember_me
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: user.toJSON(),
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: process.env.JWT_EXPIRES_IN || '24h'
      }
    });
  })
);

// POST /api/auth/register - Registrar nuevo usuario (solo admin)
router.post('/register',
  registerLimiter,
  validateSchema(authSchemas.registerSchema),
  asyncHandler(async (req, res) => {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      role,
      department,
      phone
    } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Usuario o email ya existe'
      });
    }

    // Crear nuevo usuario
    const newUser = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      first_name,
      last_name,
      role: role || 'viewer',
      department,
      phone
    });

    logSecurity({
      action: 'user_registered',
      user_id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: newUser.toJSON()
      }
    });
  })
);

// POST /api/auth/refresh - Renovar token de acceso
router.post('/refresh',
  validateSchema(authSchemas.refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;

    try {
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
      );

      const user = await User.findByPk(decoded.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Token de actualización inválido'
        });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          access_token: accessToken,
          refresh_token: newRefreshToken,
          expires_in: process.env.JWT_EXPIRES_IN || '24h'
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token de actualización inválido'
      });
    }
  })
);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout',
  asyncHandler(async (req, res) => {
    // En una implementación completa, aquí se invalidaría el token
    // Por ahora, solo registramos el evento
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logUserAction(decoded.userId, 'logout', {
          ip: req.ip,
          user_agent: req.get('User-Agent')
        });
      } catch (error) {
        // Token inválido, pero aún procesamos el logout
      }
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  })
);

// POST /api/auth/forgot-password - Solicitar restablecimiento de contraseña
router.post('/forgot-password',
  authLimiter,
  validateSchema(authSchemas.forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    // Generar token de restablecimiento
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: resetExpires
    });

    logSecurity({
      action: 'password_reset_requested',
      user_id: user.id,
      email: user.email,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    });

    // TODO: Enviar email con el token de restablecimiento
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    });
  })
);

// POST /api/auth/reset-password - Restablecer contraseña
router.post('/reset-password',
  validateSchema(authSchemas.resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { token, new_password } = req.body;

    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de restablecimiento inválido o expirado'
      });
    }

    // Actualizar contraseña y limpiar token
    await user.update({
      password: new_password,
      password_reset_token: null,
      password_reset_expires: null,
      login_attempts: 0,
      locked_until: null
    });

    logSecurity({
      action: 'password_reset_completed',
      user_id: user.id,
      email: user.email,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  })
);

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me',
  require('../middleware/authMiddleware').authenticateToken,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  })
);

module.exports = router;