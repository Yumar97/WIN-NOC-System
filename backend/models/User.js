const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        isAlphanumeric: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 255]
      }
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'supervisor', 'technician', 'analyst', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer'
    },
    department: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[\+]?[1-9][\d]{0,15}$/
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    two_factor_secret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        theme: 'light',
        language: 'es',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        dashboard: {
          refresh_interval: 30,
          default_view: 'overview'
        }
      }
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'America/Lima'
    }
  }, {
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['department']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Métodos de instancia
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  User.prototype.isLocked = function() {
    return this.locked_until && this.locked_until > new Date();
  };

  User.prototype.incrementLoginAttempts = async function() {
    // Si ya está bloqueado y el tiempo ha expirado, resetear
    if (this.locked_until && this.locked_until < new Date()) {
      return await this.update({
        login_attempts: 1,
        locked_until: null
      });
    }

    const updates = { login_attempts: this.login_attempts + 1 };
    
    // Bloquear después de 5 intentos fallidos
    if (this.login_attempts + 1 >= 5 && !this.isLocked()) {
      updates.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    }

    return await this.update(updates);
  };

  User.prototype.resetLoginAttempts = async function() {
    return await this.update({
      login_attempts: 0,
      locked_until: null
    });
  };

  User.prototype.updateLastLogin = async function() {
    return await this.update({
      last_login: new Date()
    });
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.password_reset_token;
    delete values.two_factor_secret;
    return values;
  };

  // Métodos estáticos
  User.findByEmail = function(email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  };

  User.findByUsername = function(username) {
    return this.findOne({ where: { username: username.toLowerCase() } });
  };

  User.findActive = function() {
    return this.findAll({ where: { is_active: true } });
  };

  User.findByRole = function(role) {
    return this.findAll({ where: { role, is_active: true } });
  };

  return User;
};