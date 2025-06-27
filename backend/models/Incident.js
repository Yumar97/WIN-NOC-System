module.exports = (sequelize, DataTypes) => {
  const Incident = sequelize.define('Incident', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    incident_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [5, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(
        'network_outage',
        'performance_degradation',
        'security_incident',
        'hardware_failure',
        'software_issue',
        'connectivity_problem',
        'service_disruption',
        'maintenance_required',
        'customer_complaint',
        'other'
      ),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
      allowNull: false,
      defaultValue: 'medium'
    },
    severity: {
      type: DataTypes.ENUM('sev1', 'sev2', 'sev3', 'sev4'),
      allowNull: false,
      defaultValue: 'sev3'
    },
    status: {
      type: DataTypes.ENUM(
        'open',
        'in_progress',
        'pending',
        'resolved',
        'closed',
        'cancelled'
      ),
      allowNull: false,
      defaultValue: 'open'
    },
    source: {
      type: DataTypes.ENUM(
        'monitoring_system',
        'customer_report',
        'internal_detection',
        'third_party',
        'scheduled_maintenance'
      ),
      allowNull: false,
      defaultValue: 'monitoring_system'
    },
    affected_services: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    affected_customers: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    business_impact: {
      type: DataTypes.ENUM('none', 'low', 'medium', 'high', 'critical'),
      defaultValue: 'low'
    },
    root_cause: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    workaround: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    device_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'network_devices',
        key: 'id'
      }
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    detected_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    acknowledged_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sla_target: {
      type: DataTypes.INTEGER, // minutos
      allowNull: true
    },
    sla_breach: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    escalation_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    escalated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    communication_log: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    coordinates: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true
    },
    external_ticket_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    change_request_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    metrics: {
      type: DataTypes.JSONB,
      defaultValue: {
        response_time: null,
        resolution_time: null,
        customer_satisfaction: null,
        escalations: 0,
        reopened_count: 0
      }
    }
  }, {
    tableName: 'incidents',
    indexes: [
      {
        unique: true,
        fields: ['incident_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['severity']
      },
      {
        fields: ['category']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['device_id']
      },
      {
        fields: ['customer_id']
      },
      {
        fields: ['detected_at']
      },
      {
        fields: ['sla_breach']
      },
      {
        fields: ['business_impact']
      }
    ],
    hooks: {
      beforeCreate: async (incident) => {
        // Generar número de incidencia automático
        if (!incident.incident_number) {
          const year = new Date().getFullYear();
          const month = String(new Date().getMonth() + 1).padStart(2, '0');
          const count = await Incident.count({
            where: sequelize.where(
              sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM created_at')),
              year
            )
          });
          incident.incident_number = `INC-${year}${month}-${String(count + 1).padStart(4, '0')}`;
        }

        // Establecer SLA target basado en prioridad
        if (!incident.sla_target) {
          const slaTargets = {
            critical: 240,  // 4 horas
            high: 480,      // 8 horas
            medium: 1440,   // 24 horas
            low: 4320       // 72 horas
          };
          incident.sla_target = slaTargets[incident.priority];
        }
      },
      beforeUpdate: async (incident) => {
        // Actualizar timestamps basado en cambios de estado
        if (incident.changed('status')) {
          const now = new Date();
          
          switch (incident.status) {
            case 'in_progress':
              if (!incident.acknowledged_at) {
                incident.acknowledged_at = now;
              }
              break;
            case 'resolved':
              if (!incident.resolved_at) {
                incident.resolved_at = now;
              }
              break;
            case 'closed':
              if (!incident.closed_at) {
                incident.closed_at = now;
              }
              break;
          }
        }

        // Verificar breach de SLA
        if (incident.sla_target && !incident.sla_breach) {
          const elapsedMinutes = (new Date() - incident.detected_at) / (1000 * 60);
          if (elapsedMinutes > incident.sla_target && !['resolved', 'closed'].includes(incident.status)) {
            incident.sla_breach = true;
          }
        }
      }
    }
  });

  // Métodos de instancia
  Incident.prototype.getElapsedTime = function() {
    const endTime = this.resolved_at || this.closed_at || new Date();
    return Math.floor((endTime - this.detected_at) / (1000 * 60)); // en minutos
  };

  Incident.prototype.getTimeToResolution = function() {
    if (!this.resolved_at) return null;
    return Math.floor((this.resolved_at - this.detected_at) / (1000 * 60)); // en minutos
  };

  Incident.prototype.getSLAStatus = function() {
    if (!this.sla_target) return 'no_sla';
    
    const elapsed = this.getElapsedTime();
    const remaining = this.sla_target - elapsed;
    
    if (this.sla_breach) return 'breached';
    if (remaining <= 0) return 'breached';
    if (remaining <= this.sla_target * 0.1) return 'critical'; // 10% restante
    if (remaining <= this.sla_target * 0.25) return 'warning'; // 25% restante
    return 'on_track';
  };

  Incident.prototype.addCommunication = async function(message, userId, type = 'note') {
    const communication = {
      id: require('crypto').randomUUID(),
      message,
      user_id: userId,
      type,
      timestamp: new Date().toISOString()
    };
    
    const updatedLog = [...(this.communication_log || []), communication];
    return await this.update({ communication_log: updatedLog });
  };

  Incident.prototype.escalate = async function(level = null) {
    const newLevel = level || (this.escalation_level + 1);
    return await this.update({
      escalation_level: newLevel,
      escalated_at: new Date()
    });
  };

  // Métodos estáticos
  Incident.findOpen = function() {
    return this.findAll({
      where: {
        status: ['open', 'in_progress', 'pending']
      }
    });
  };

  Incident.findByPriority = function(priority) {
    return this.findAll({
      where: { priority },
      order: [['detected_at', 'DESC']]
    });
  };

  Incident.findSLABreached = function() {
    return this.findAll({
      where: { sla_breach: true }
    });
  };

  Incident.findByDateRange = function(startDate, endDate) {
    return this.findAll({
      where: {
        detected_at: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate]
        }
      }
    });
  };

  return Incident;
};