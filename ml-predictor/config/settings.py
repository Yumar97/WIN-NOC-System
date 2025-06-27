"""
Configuración del módulo de Machine Learning
WIN NOC - Centro de Operaciones de Red
"""

import os
from datetime import timedelta

class Config:
    """Configuración base"""
    
    # Configuración de Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'win-ml-secret-key-2024')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    TESTING = False
    
    # Configuración de base de datos
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'win_noc_db')
    DB_USER = os.getenv('DB_USER', 'win_admin')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'win_secure_2024')
    
    SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    # Configuración de Redis (para cache)
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    
    # Configuración de Machine Learning
    ML_CONFIG = {
        'models_path': os.getenv('MODELS_PATH', 'models/'),
        'data_path': os.getenv('DATA_PATH', 'data/'),
        'logs_path': os.getenv('LOGS_PATH', 'logs/'),
        'temp_path': os.getenv('TEMP_PATH', 'temp/'),
        
        # Configuración de entrenamiento
        'training': {
            'batch_size': int(os.getenv('ML_BATCH_SIZE', 32)),
            'epochs': int(os.getenv('ML_EPOCHS', 100)),
            'validation_split': float(os.getenv('ML_VALIDATION_SPLIT', 0.2)),
            'early_stopping_patience': int(os.getenv('ML_EARLY_STOPPING', 10)),
            'learning_rate': float(os.getenv('ML_LEARNING_RATE', 0.001)),
        },
        
        # Configuración de predicción
        'prediction': {
            'default_horizon': int(os.getenv('ML_DEFAULT_HORIZON', 24)),  # horas
            'confidence_threshold': float(os.getenv('ML_CONFIDENCE_THRESHOLD', 0.8)),
            'max_prediction_days': int(os.getenv('ML_MAX_PREDICTION_DAYS', 30)),
        },
        
        # Configuración de detección de anomalías
        'anomaly_detection': {
            'contamination': float(os.getenv('ML_CONTAMINATION', 0.1)),
            'n_estimators': int(os.getenv('ML_N_ESTIMATORS', 100)),
            'max_samples': int(os.getenv('ML_MAX_SAMPLES', 256)),
            'threshold_percentile': int(os.getenv('ML_THRESHOLD_PERCENTILE', 95)),
        },
        
        # Configuración de series temporales
        'time_series': {
            'seasonality_mode': os.getenv('ML_SEASONALITY_MODE', 'multiplicative'),
            'yearly_seasonality': os.getenv('ML_YEARLY_SEASONALITY', 'auto'),
            'weekly_seasonality': os.getenv('ML_WEEKLY_SEASONALITY', 'auto'),
            'daily_seasonality': os.getenv('ML_DAILY_SEASONALITY', 'auto'),
            'changepoint_prior_scale': float(os.getenv('ML_CHANGEPOINT_PRIOR', 0.05)),
        }
    }
    
    # Configuración de datos
    DATA_CONFIG = {
        'retention_days': int(os.getenv('DATA_RETENTION_DAYS', 365)),
        'aggregation_intervals': {
            'minute': 1,
            'hour': 60,
            'day': 1440,
            'week': 10080,
            'month': 43200
        },
        'preprocessing': {
            'outlier_method': os.getenv('OUTLIER_METHOD', 'iqr'),
            'missing_value_strategy': os.getenv('MISSING_VALUE_STRATEGY', 'interpolate'),
            'normalization_method': os.getenv('NORMALIZATION_METHOD', 'standard'),
            'feature_selection': os.getenv('FEATURE_SELECTION', 'auto'),
        }
    }
    
    # Configuración de alertas
    ALERT_CONFIG = {
        'thresholds': {
            'cpu_usage': {
                'warning': float(os.getenv('CPU_WARNING_THRESHOLD', 80.0)),
                'critical': float(os.getenv('CPU_CRITICAL_THRESHOLD', 95.0))
            },
            'memory_usage': {
                'warning': float(os.getenv('MEMORY_WARNING_THRESHOLD', 85.0)),
                'critical': float(os.getenv('MEMORY_CRITICAL_THRESHOLD', 95.0))
            },
            'disk_usage': {
                'warning': float(os.getenv('DISK_WARNING_THRESHOLD', 80.0)),
                'critical': float(os.getenv('DISK_CRITICAL_THRESHOLD', 90.0))
            },
            'network_latency': {
                'warning': float(os.getenv('LATENCY_WARNING_THRESHOLD', 100.0)),  # ms
                'critical': float(os.getenv('LATENCY_CRITICAL_THRESHOLD', 500.0))
            },
            'packet_loss': {
                'warning': float(os.getenv('PACKET_LOSS_WARNING', 1.0)),  # %
                'critical': float(os.getenv('PACKET_LOSS_CRITICAL', 5.0))
            }
        },
        'notification_cooldown': int(os.getenv('ALERT_COOLDOWN', 300)),  # segundos
        'max_alerts_per_hour': int(os.getenv('MAX_ALERTS_PER_HOUR', 10))
    }
    
    # Configuración de API externa
    API_CONFIG = {
        'backend_url': os.getenv('BACKEND_URL', 'http://localhost:3001/api'),
        'timeout': int(os.getenv('API_TIMEOUT', 30)),
        'retry_attempts': int(os.getenv('API_RETRY_ATTEMPTS', 3)),
        'retry_delay': int(os.getenv('API_RETRY_DELAY', 1)),
    }
    
    # Configuración de logging
    LOGGING_CONFIG = {
        'level': os.getenv('LOG_LEVEL', 'INFO'),
        'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        'file_max_bytes': int(os.getenv('LOG_FILE_MAX_BYTES', 10485760)),  # 10MB
        'file_backup_count': int(os.getenv('LOG_FILE_BACKUP_COUNT', 5)),
        'enable_console': os.getenv('LOG_ENABLE_CONSOLE', 'true').lower() == 'true',
        'enable_file': os.getenv('LOG_ENABLE_FILE', 'true').lower() == 'true',
    }
    
    # Configuración de seguridad
    SECURITY_CONFIG = {
        'api_key_required': os.getenv('API_KEY_REQUIRED', 'false').lower() == 'true',
        'api_key': os.getenv('ML_API_KEY', 'win_ml_api_key_2024'),
        'rate_limit': {
            'requests_per_minute': int(os.getenv('RATE_LIMIT_RPM', 60)),
            'requests_per_hour': int(os.getenv('RATE_LIMIT_RPH', 1000)),
        },
        'cors_origins': os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(','),
    }
    
    # Configuración de monitoreo
    MONITORING_CONFIG = {
        'enable_metrics': os.getenv('ENABLE_METRICS', 'true').lower() == 'true',
        'metrics_port': int(os.getenv('METRICS_PORT', 8000)),
        'health_check_interval': int(os.getenv('HEALTH_CHECK_INTERVAL', 30)),  # segundos
        'performance_tracking': os.getenv('PERFORMANCE_TRACKING', 'true').lower() == 'true',
    }
    
    # Configuración de tareas programadas
    SCHEDULER_CONFIG = {
        'timezone': os.getenv('SCHEDULER_TIMEZONE', 'America/Lima'),
        'job_defaults': {
            'coalesce': True,
            'max_instances': 1,
            'misfire_grace_time': 300  # 5 minutos
        },
        'executors': {
            'default': {
                'type': 'threadpool',
                'max_workers': int(os.getenv('SCHEDULER_MAX_WORKERS', 4))
            }
        }
    }

class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    TESTING = False
    
    # Configuración más permisiva para desarrollo
    ML_CONFIG = Config.ML_CONFIG.copy()
    ML_CONFIG['training']['epochs'] = 10  # Menos épocas para desarrollo
    ML_CONFIG['training']['batch_size'] = 16  # Batch size menor
    
    LOGGING_CONFIG = Config.LOGGING_CONFIG.copy()
    LOGGING_CONFIG['level'] = 'DEBUG'

class TestingConfig(Config):
    """Configuración para testing"""
    TESTING = True
    DEBUG = True
    
    # Base de datos en memoria para tests
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Configuración mínima para tests
    ML_CONFIG = Config.ML_CONFIG.copy()
    ML_CONFIG['training']['epochs'] = 1
    ML_CONFIG['training']['batch_size'] = 8
    
    # Desactivar tareas programadas en tests
    SCHEDULER_CONFIG = Config.SCHEDULER_CONFIG.copy()
    SCHEDULER_CONFIG['job_defaults']['coalesce'] = False

class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    TESTING = False
    
    # Configuración optimizada para producción
    ML_CONFIG = Config.ML_CONFIG.copy()
    ML_CONFIG['training']['batch_size'] = 64
    ML_CONFIG['training']['epochs'] = 200
    
    LOGGING_CONFIG = Config.LOGGING_CONFIG.copy()
    LOGGING_CONFIG['level'] = 'WARNING'
    
    # Seguridad habilitada en producción
    SECURITY_CONFIG = Config.SECURITY_CONFIG.copy()
    SECURITY_CONFIG['api_key_required'] = True

# Mapeo de configuraciones
config_map = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Obtener configuración basada en el entorno"""
    env = os.getenv('FLASK_ENV', 'development')
    return config_map.get(env, config_map['default'])