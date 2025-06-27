const Joi = require('joi');

// Esquema para login
const loginSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre de usuario es requerido',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede exceder 100 caracteres',
      'any.required': 'El nombre de usuario es requerido'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
  remember_me: Joi.boolean()
    .default(false)
});

// Esquema para registro
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
      'string.empty': 'El nombre de usuario es requerido',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede exceder 50 caracteres',
      'any.required': 'El nombre de usuario es requerido'
    }),
  email: Joi.string()
    .email()
    .max(100)
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'string.empty': 'El email es requerido',
      'string.max': 'El email no puede exceder 100 caracteres',
      'any.required': 'El email es requerido'
    }),
  password: Joi.string()
    .min(8)
    .max(255)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.max': 'La contraseña no puede exceder 255 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
      'any.required': 'La contraseña es requerida'
    }),
  confirm_password: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'La confirmación de contraseña es requerida'
    }),
  first_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(new RegExp('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'))
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios',
      'any.required': 'El nombre es requerido'
    }),
  last_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(new RegExp('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'))
    .required()
    .messages({
      'string.empty': 'El apellido es requerido',
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
      'string.pattern.base': 'El apellido solo puede contener letras y espacios',
      'any.required': 'El apellido es requerido'
    }),
  role: Joi.string()
    .valid('admin', 'supervisor', 'technician', 'analyst', 'viewer')
    .default('viewer')
    .messages({
      'any.only': 'El rol debe ser uno de: admin, supervisor, technician, analyst, viewer'
    }),
  department: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'El departamento no puede exceder 50 caracteres'
    }),
  phone: Joi.string()
    .pattern(new RegExp('^[\\+]?[1-9][\\d]{0,15}$'))
    .allow('')
    .messages({
      'string.pattern.base': 'El teléfono debe ser un número válido'
    })
});

// Esquema para refresh token
const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string()
    .required()
    .messages({
      'string.empty': 'El token de actualización es requerido',
      'any.required': 'El token de actualización es requerido'
    })
});

// Esquema para forgot password
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'string.empty': 'El email es requerido',
      'any.required': 'El email es requerido'
    })
});

// Esquema para reset password
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'El token de restablecimiento es requerido',
      'any.required': 'El token de restablecimiento es requerido'
    }),
  new_password: Joi.string()
    .min(8)
    .max(255)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.empty': 'La nueva contraseña es requerida',
      'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
      'string.max': 'La nueva contraseña no puede exceder 255 caracteres',
      'string.pattern.base': 'La nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
      'any.required': 'La nueva contraseña es requerida'
    }),
  confirm_password: Joi.string()
    .valid(Joi.ref('new_password'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'La confirmación de contraseña es requerida'
    })
});

// Esquema para cambio de contraseña
const changePasswordSchema = Joi.object({
  current_password: Joi.string()
    .required()
    .messages({
      'string.empty': 'La contraseña actual es requerida',
      'any.required': 'La contraseña actual es requerida'
    }),
  new_password: Joi.string()
    .min(8)
    .max(255)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.empty': 'La nueva contraseña es requerida',
      'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
      'string.max': 'La nueva contraseña no puede exceder 255 caracteres',
      'string.pattern.base': 'La nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
      'any.required': 'La nueva contraseña es requerida'
    }),
  confirm_password: Joi.string()
    .valid(Joi.ref('new_password'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'La confirmación de contraseña es requerida'
    })
});

// Esquema para actualizar perfil
const updateProfileSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(new RegExp('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'))
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios'
    }),
  last_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(new RegExp('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'))
    .messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
      'string.pattern.base': 'El apellido solo puede contener letras y espacios'
    }),
  phone: Joi.string()
    .pattern(new RegExp('^[\\+]?[1-9][\\d]{0,15}$'))
    .allow('')
    .messages({
      'string.pattern.base': 'El teléfono debe ser un número válido'
    }),
  department: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'El departamento no puede exceder 50 caracteres'
    }),
  timezone: Joi.string()
    .max(50)
    .messages({
      'string.max': 'La zona horaria no puede exceder 50 caracteres'
    }),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark').default('light'),
    language: Joi.string().valid('es', 'en').default('es'),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      push: Joi.boolean().default(true),
      sms: Joi.boolean().default(false)
    }).default(),
    dashboard: Joi.object({
      refresh_interval: Joi.number().min(10).max(300).default(30),
      default_view: Joi.string().valid('overview', 'incidents', 'network', 'analytics').default('overview')
    }).default()
  }).default()
});

module.exports = {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema
};