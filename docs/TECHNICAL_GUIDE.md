# WIN NOC - Guía Técnica del Sistema

## Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Requisitos Técnicos](#requisitos-técnicos)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [APIs y Endpoints](#apis-y-endpoints)
6. [Base de Datos](#base-de-datos)
7. [Módulo de IA/ML](#módulo-de-iaml)
8. [Seguridad](#seguridad)
9. [Monitoreo y Logging](#monitoreo-y-logging)
10. [Despliegue](#despliegue)
11. [Troubleshooting](#troubleshooting)

## Arquitectura del Sistema

### Visión General

El sistema WIN NOC está construido con una arquitectura de microservicios que incluye:

- **Frontend**: React 18.2.0 con Tailwind CSS
- **Backend**: Node.js 20.x con Express.js
- **Base de Datos**: PostgreSQL 15+
- **IA/ML**: Python 3.11 con TensorFlow
- **Cache**: Redis
- **Proxy**: Nginx
- **Contenedores**: Docker & Docker Compose

### Diagrama de Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   ML Predictor  │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Python)      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   PostgreSQL    │    │     Redis       │
│   (Proxy)       │    │   (Database)    │    │    (Cache)      │
│   Port: 80/443  │    │   Port: 5432    │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Requisitos Técnicos

### Software Requerido

- **Node.js**: 20.x o superior
- **Python**: 3.11 o superior
- **PostgreSQL**: 15 o superior
- **Redis**: 7.x o superior (opcional)
- **Docker**: 20.x o superior (opcional)
- **Git**: Para control de versiones

### Hardware Recomendado

#### Desarrollo
- **CPU**: 4 cores mínimo
- **RAM**: 8GB mínimo, 16GB recomendado
- **Almacenamiento**: 50GB disponibles
- **Red**: Conexión estable a internet

#### Producción
- **CPU**: 8 cores mínimo
- **RAM**: 32GB mínimo, 64GB recomendado
- **Almacenamiento**: 500GB SSD
- **Red**: Conexión redundante de alta velocidad

## Instalación y Configuración

### Instalación Automática

```bash
# Clonar el repositorio
git clone <repository-url>
cd win-noc-system

# Ejecutar script de configuración (Windows)
setup.bat

# O manualmente en Linux/Mac
chmod +x setup.sh
./setup.sh
```

### Instalación Manual

#### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tu configuración
npm run dev
```

#### 2. Frontend

```bash
cd frontend
npm install
npm start
```

#### 3. Módulo ML

```bash
cd ml-predictor
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate.bat  # Windows
pip install -r requirements.txt
python app.py
```

#### 4. Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE win_noc_db;
CREATE USER win_admin WITH PASSWORD 'win_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE win_noc_db TO win_admin;
```

## Estructura del Proyecto

```
win-noc-system/
├── backend/                 # API Backend (Node.js)
│   ├── config/             # Configuraciones
│   ├── controllers/        # Controladores
│   ├── middleware/         # Middlewares
│   ├── models/            # Modelos de datos
│   ├── routes/            # Rutas de API
│   ├── services/          # Lógica de negocio
│   ├── utils/             # Utilidades
│   ├── schemas/           # Esquemas de validación
│   ├── database/          # Migraciones y seeds
│   └── tests/             # Pruebas
├── frontend/               # Aplicación Web (React)
│   ├── public/            # Archivos públicos
│   ├── src/               # Código fuente
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── contexts/      # Contextos React
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── services/      # Servicios API
│   │   ├── utils/         # Utilidades
│   │   └── styles/        # Estilos
│   └── build/             # Build de producción
├── ml-predictor/           # Módulo de IA/ML (Python)
│   ├── config/            # Configuraciones
│   ├── models/            # Modelos ML
│   ├── services/          # Servicios ML
│   ├── utils/             # Utilidades
│   ├── data/              # Datos de entrenamiento
│   └── logs/              # Logs del sistema
├── docs/                   # Documentación
├── nginx/                  # Configuración Nginx
├── docker-compose.yml      # Orquestación Docker
└── README.md              # Documentación principal
```

## APIs y Endpoints

### Backend API (Puerto 3001)

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Información del usuario

#### Dashboard
- `GET /api/dashboard/overview` - Resumen general
- `GET /api/dashboard/metrics` - Métricas en tiempo real
- `GET /api/dashboard/alerts` - Alertas activas

#### Incidencias
- `GET /api/incidents` - Listar incidencias
- `POST /api/incidents` - Crear incidencia
- `GET /api/incidents/:id` - Obtener incidencia
- `PUT /api/incidents/:id` - Actualizar incidencia
- `DELETE /api/incidents/:id` - Eliminar incidencia

#### Red y Dispositivos
- `GET /api/network/devices` - Listar dispositivos
- `POST /api/network/devices` - Agregar dispositivo
- `GET /api/network/devices/:id` - Obtener dispositivo
- `PUT /api/network/devices/:id` - Actualizar dispositivo
- `GET /api/network/topology` - Topología de red

### ML API (Puerto 5000)

#### Predicciones
- `POST /api/predict/network` - Predicción de rendimiento
- `POST /api/predict/incidents` - Predicción de incidencias
- `POST /api/forecast/performance` - Pronóstico de rendimiento

#### Análisis
- `POST /api/detect/anomalies` - Detección de anomalías
- `POST /api/analyze/network` - Análisis de red
- `GET /api/health` - Estado del servicio

## Base de Datos

### Esquema Principal

#### Usuarios
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Incidencias
```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category incident_category NOT NULL,
    priority incident_priority NOT NULL DEFAULT 'medium',
    status incident_status NOT NULL DEFAULT 'open',
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Dispositivos de Red
```sql
CREATE TABLE network_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    hostname VARCHAR(100) UNIQUE NOT NULL,
    ip_address INET UNIQUE NOT NULL,
    device_type device_type NOT NULL,
    status device_status NOT NULL DEFAULT 'unknown',
    location VARCHAR(200),
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Migraciones

Las migraciones se ejecutan automáticamente al iniciar el backend:

```bash
cd backend
npm run migrate
```

## Módulo de IA/ML

### Funcionalidades

1. **Predicción de Rendimiento**: Predice el rendimiento futuro de dispositivos de red
2. **Detección de Anomalías**: Identifica comportamientos anómalos en tiempo real
3. **Predicción de Incidencias**: Predice la probabilidad de incidencias futuras
4. **Análisis de Tendencias**: Analiza patrones históricos y tendencias

### Modelos Implementados

- **LSTM**: Para series temporales de métricas de red
- **Isolation Forest**: Para detección de anomalías
- **Prophet**: Para pronósticos estacionales
- **Random Forest**: Para clasificación de incidencias

### Entrenamiento de Modelos

```python
# Entrenar modelo de predicción de red
from services.prediction_service import PredictionService

service = PredictionService()
service.train_network_model(training_data)
```

## Seguridad

### Autenticación y Autorización

- **JWT Tokens**: Para autenticación de usuarios
- **Roles y Permisos**: Sistema basado en roles (admin, supervisor, technician, analyst, viewer)
- **Rate Limiting**: Limitación de requests por IP/usuario
- **CORS**: Configurado para dominios específicos

### Seguridad de Datos

- **Encriptación**: Contraseñas hasheadas con bcrypt
- **Validación**: Validación estricta de inputs con Joi
- **SQL Injection**: Protección con Sequelize ORM
- **XSS**: Sanitización de datos de entrada

### Variables de Entorno

```bash
# Backend
JWT_SECRET=your_jwt_secret_key
DB_PASSWORD=your_db_password
REDIS_PASSWORD=your_redis_password

# ML
ML_API_KEY=your_ml_api_key
SECRET_KEY=your_flask_secret_key
```

## Monitoreo y Logging

### Logging

#### Backend (Winston)
```javascript
const logger = require('./utils/logger');
logger.info('Información general');
logger.error('Error crítico', { error: err });
```

#### ML (Python Logging)
```python
import logging
logger = logging.getLogger(__name__)
logger.info('Información del modelo')
```

### Métricas

- **Prometheus**: Métricas de aplicación
- **Health Checks**: Endpoints de salud en cada servicio
- **Performance Monitoring**: Seguimiento de rendimiento

### Alertas

- **Slack/Teams**: Notificaciones de incidencias críticas
- **Email**: Alertas por correo electrónico
- **Dashboard**: Alertas en tiempo real en la interfaz

## Despliegue

### Docker Compose (Recomendado)

```bash
# Desarrollo
docker-compose up --build

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

### Despliegue Manual

#### Backend
```bash
cd backend
npm install --production
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Servir con nginx o servidor web
```

#### ML
```bash
cd ml-predictor
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:5000 app:app
```

### AWS/Azure

1. **EC2/VM**: Para servicios de aplicación
2. **RDS/Azure Database**: Para PostgreSQL
3. **ElastiCache/Redis Cache**: Para Redis
4. **S3/Blob Storage**: Para archivos estáticos
5. **Load Balancer**: Para distribución de carga

## Troubleshooting

### Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Verificar credenciales en .env
DB_HOST=localhost
DB_USER=win_admin
DB_PASSWORD=win_secure_2024
```

#### Error de Dependencias Node.js
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### Error de Modelos ML
```bash
# Verificar Python y dependencias
python --version
pip list | grep tensorflow

# Reinstalar dependencias ML
pip install -r requirements.txt --force-reinstall
```

#### Error de CORS
```javascript
// Verificar configuración CORS en backend
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```

### Logs de Depuración

```bash
# Backend logs
tail -f backend/logs/combined.log

# ML logs
tail -f ml-predictor/logs/ml-predictor.log

# Docker logs
docker-compose logs -f [service_name]
```

### Comandos Útiles

```bash
# Reiniciar servicios
docker-compose restart

# Ver estado de contenedores
docker-compose ps

# Acceder a contenedor
docker-compose exec backend bash

# Backup de base de datos
pg_dump win_noc_db > backup.sql

# Restaurar base de datos
psql win_noc_db < backup.sql
```

## Contacto y Soporte

- **Equipo de Desarrollo**: dev-team@win.pe
- **Arquitecto de Sistemas**: arquitecto@win.pe
- **Documentación**: [Wiki interno]
- **Issues**: [Sistema de tickets interno]

---

**Última actualización**: Diciembre 2024  
**Versión del documento**: 1.0.0