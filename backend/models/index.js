const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Inicializar Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Importar modelos
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Incident = require('./Incident')(sequelize, Sequelize.DataTypes);
const NetworkDevice = require('./NetworkDevice')(sequelize, Sequelize.DataTypes);
const NetworkMetric = require('./NetworkMetric')(sequelize, Sequelize.DataTypes);
const Customer = require('./Customer')(sequelize, Sequelize.DataTypes);
const CustomerFeedback = require('./CustomerFeedback')(sequelize, Sequelize.DataTypes);
const Alert = require('./Alert')(sequelize, Sequelize.DataTypes);
const MaintenanceWindow = require('./MaintenanceWindow')(sequelize, Sequelize.DataTypes);
const SLATarget = require('./SLATarget')(sequelize, Sequelize.DataTypes);
const Report = require('./Report')(sequelize, Sequelize.DataTypes);
const AuditLog = require('./AuditLog')(sequelize, Sequelize.DataTypes);

// Definir asociaciones
const db = {
  sequelize,
  Sequelize,
  User,
  Incident,
  NetworkDevice,
  NetworkMetric,
  Customer,
  CustomerFeedback,
  Alert,
  MaintenanceWindow,
  SLATarget,
  Report,
  AuditLog
};

// Asociaciones entre modelos

// Usuario - Incidencias
User.hasMany(Incident, { foreignKey: 'assigned_to', as: 'assignedIncidents' });
User.hasMany(Incident, { foreignKey: 'created_by', as: 'createdIncidents' });
Incident.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });
Incident.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Dispositivo de Red - Métricas
NetworkDevice.hasMany(NetworkMetric, { foreignKey: 'device_id', as: 'metrics' });
NetworkMetric.belongsTo(NetworkDevice, { foreignKey: 'device_id', as: 'device' });

// Dispositivo de Red - Incidencias
NetworkDevice.hasMany(Incident, { foreignKey: 'device_id', as: 'incidents' });
Incident.belongsTo(NetworkDevice, { foreignKey: 'device_id', as: 'device' });

// Cliente - Feedback
Customer.hasMany(CustomerFeedback, { foreignKey: 'customer_id', as: 'feedback' });
CustomerFeedback.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Cliente - Incidencias
Customer.hasMany(Incident, { foreignKey: 'customer_id', as: 'incidents' });
Incident.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Dispositivo de Red - Alertas
NetworkDevice.hasMany(Alert, { foreignKey: 'device_id', as: 'alerts' });
Alert.belongsTo(NetworkDevice, { foreignKey: 'device_id', as: 'device' });

// Usuario - Alertas
User.hasMany(Alert, { foreignKey: 'assigned_to', as: 'assignedAlerts' });
Alert.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });

// Dispositivo de Red - Ventanas de Mantenimiento
NetworkDevice.hasMany(MaintenanceWindow, { foreignKey: 'device_id', as: 'maintenanceWindows' });
MaintenanceWindow.belongsTo(NetworkDevice, { foreignKey: 'device_id', as: 'device' });

// Usuario - Ventanas de Mantenimiento
User.hasMany(MaintenanceWindow, { foreignKey: 'created_by', as: 'createdMaintenanceWindows' });
MaintenanceWindow.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Usuario - Reportes
User.hasMany(Report, { foreignKey: 'created_by', as: 'createdReports' });
Report.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Usuario - Logs de Auditoría
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = db;