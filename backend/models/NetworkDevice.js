module.exports = (sequelize, DataTypes) => {
  const NetworkDevice = sequelize.define('NetworkDevice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    hostname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: false,
      unique: true,
      validate: {
        isIP: true
      }
    },
    mac_address: {
      type: DataTypes.STRING(17),
      allowNull: true,
      validate: {
        is: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
      }
    },
    device_type: {
      type: DataTypes.ENUM(
        'router',
        'switch',
        'firewall',
        'access_point',
        'server',
        'load_balancer',
        'gateway',
        'modem',
        'repeater',
        'bridge',
        'hub',
        'other'
      ),
      allowNull: false
    },
    vendor: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    serial_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    firmware_version: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    coordinates: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true
    },
    site_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    rack_position: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'warning', 'critical', 'maintenance', 'unknown'),
      allowNull: false,
      defaultValue: 'unknown'
    },
    is_monitored: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_critical: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    monitoring_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    snmp_community: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    snmp_version: {
      type: DataTypes.ENUM('v1', 'v2c', 'v3'),
      defaultValue: 'v2c'
    },
    snmp_port: {
      type: DataTypes.INTEGER,
      defaultValue: 161,
      validate: {
        min: 1,
        max: 65535
      }
    },
    ssh_port: {
      type: DataTypes.INTEGER,
      defaultValue: 22,
      validate: {
        min: 1,
        max: 65535
      }
    },
    http_port: {
      type: DataTypes.INTEGER,
      defaultValue: 80,
      validate: {
        min: 1,
        max: 65535
      }
    },
    https_port: {
      type: DataTypes.INTEGER,
      defaultValue: 443,
      validate: {
        min: 1,
        max: 65535
      }
    },
    management_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    configuration: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    capabilities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    interfaces: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    vlans: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: []
    },
    routing_protocols: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_backup: {
      type: DataTypes.DATE,
      allowNull: true
    },
    next_maintenance: {
      type: DataTypes.DATE,
      allowNull: true
    },
    warranty_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    power_consumption: {
      type: DataTypes.INTEGER, // watts
      allowNull: true
    },
    temperature_threshold: {
      type: DataTypes.JSONB,
      defaultValue: {
        warning: 60,
        critical: 80
      }
    },
    cpu_threshold: {
      type: DataTypes.JSONB,
      defaultValue: {
        warning: 80,
        critical: 95
      }
    },
    memory_threshold: {
      type: DataTypes.JSONB,
      defaultValue: {
        warning: 85,
        critical: 95
      }
    },
    bandwidth_threshold: {
      type: DataTypes.JSONB,
      defaultValue: {
        warning: 80,
        critical: 95
      }
    },
    uptime: {
      type: DataTypes.BIGINT, // segundos
      defaultValue: 0
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    }
  }, {
    tableName: 'network_devices',
    indexes: [
      {
        unique: true,
        fields: ['hostname']
      },
      {
        unique: true,
        fields: ['ip_address']
      },
      {
        unique: true,
        fields: ['serial_number']
      },
      {
        fields: ['device_type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['location']
      },
      {
        fields: ['site_id']
      },
      {
        fields: ['is_critical']
      },
      {
        fields: ['is_monitored']
      },
      {
        fields: ['vendor']
      },
      {
        fields: ['last_seen']
      }
    ],
    hooks: {
      beforeUpdate: async (device) => {
        // Actualizar last_seen cuando el estado cambia a online
        if (device.changed('status') && device.status === 'online') {
          device.last_seen = new Date();
        }
      }
    }
  });

  // Métodos de instancia
  NetworkDevice.prototype.isOnline = function() {
    return this.status === 'online';
  };

  NetworkDevice.prototype.isOffline = function() {
    return this.status === 'offline';
  };

  NetworkDevice.prototype.hasWarning = function() {
    return this.status === 'warning';
  };

  NetworkDevice.prototype.isCritical = function() {
    return this.status === 'critical';
  };

  NetworkDevice.prototype.getUptimeFormatted = function() {
    if (!this.uptime) return 'N/A';
    
    const days = Math.floor(this.uptime / (24 * 3600));
    const hours = Math.floor((this.uptime % (24 * 3600)) / 3600);
    const minutes = Math.floor((this.uptime % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  NetworkDevice.prototype.getLastSeenFormatted = function() {
    if (!this.last_seen) return 'Never';
    
    const now = new Date();
    const diff = now - this.last_seen;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  NetworkDevice.prototype.updateStatus = async function(newStatus) {
    const oldStatus = this.status;
    await this.update({ 
      status: newStatus,
      last_seen: newStatus === 'online' ? new Date() : this.last_seen
    });
    
    // Log del cambio de estado
    const logger = require('../utils/logger');
    logger.logSystemHealth({
      device_id: this.id,
      device_name: this.name,
      old_status: oldStatus,
      new_status: newStatus,
      ip_address: this.ip_address
    });
    
    return this;
  };

  NetworkDevice.prototype.addInterface = async function(interfaceData) {
    const interfaces = [...(this.interfaces || [])];
    interfaces.push({
      ...interfaceData,
      id: require('crypto').randomUUID(),
      added_at: new Date().toISOString()
    });
    
    return await this.update({ interfaces });
  };

  NetworkDevice.prototype.updateInterface = async function(interfaceId, updateData) {
    const interfaces = [...(this.interfaces || [])];
    const index = interfaces.findIndex(iface => iface.id === interfaceId);
    
    if (index !== -1) {
      interfaces[index] = { ...interfaces[index], ...updateData, updated_at: new Date().toISOString() };
      return await this.update({ interfaces });
    }
    
    return this;
  };

  NetworkDevice.prototype.backup = async function() {
    // Aquí se implementaría la lógica de backup del dispositivo
    return await this.update({ last_backup: new Date() });
  };

  // Métodos estáticos
  NetworkDevice.findOnline = function() {
    return this.findAll({
      where: { status: 'online' }
    });
  };

  NetworkDevice.findOffline = function() {
    return this.findAll({
      where: { status: 'offline' }
    });
  };

  NetworkDevice.findCritical = function() {
    return this.findAll({
      where: { 
        [sequelize.Sequelize.Op.or]: [
          { status: 'critical' },
          { is_critical: true }
        ]
      }
    });
  };

  NetworkDevice.findByType = function(deviceType) {
    return this.findAll({
      where: { device_type: deviceType }
    });
  };

  NetworkDevice.findByLocation = function(location) {
    return this.findAll({
      where: { location }
    });
  };

  NetworkDevice.findBySite = function(siteId) {
    return this.findAll({
      where: { site_id: siteId }
    });
  };

  NetworkDevice.findByVendor = function(vendor) {
    return this.findAll({
      where: { vendor }
    });
  };

  NetworkDevice.findNeedingMaintenance = function() {
    return this.findAll({
      where: {
        next_maintenance: {
          [sequelize.Sequelize.Op.lte]: new Date()
        }
      }
    });
  };

  NetworkDevice.findWarrantyExpiring = function(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.findAll({
      where: {
        warranty_expires: {
          [sequelize.Sequelize.Op.between]: [new Date(), futureDate]
        }
      }
    });
  };

  return NetworkDevice;
};