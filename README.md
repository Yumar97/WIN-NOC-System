# WIN - Centro de Operaciones de Red (NOC) Centralizado

## Descripción del Proyecto

Sistema web profesional para WIN, empresa peruana de telecomunicaciones, que centraliza el monitoreo de red, gestiona incidencias automáticamente, implementa análisis predictivo con inteligencia artificial y recopila retroalimentación de clientes.

## Objetivos del Sistema

- **Reducir el tiempo de resolución de incidencias (TTR) en un 30%**
- **Aumentar la disponibilidad de red al 99.5%**
- **Incrementar la satisfacción del cliente (CSAT) en un 20%**

## Arquitectura del Sistema

### Tecnologías Utilizadas

- **Frontend**: React 18.2.0 + Tailwind CSS
- **Backend**: Node.js 20.x + Express.js
- **Base de Datos**: PostgreSQL 15+
- **IA/ML**: Python 3.11 + TensorFlow
- **Nube**: AWS (EC2, RDS, Lambda)
- **Contenedores**: Docker
- **Control de Versiones**: Git + GitHub

### Estructura del Proyecto

```
win-noc-system/
├── frontend/           # Aplicación React
├── backend/           # API REST con Node.js
├── ml-predictor/      # Módulo de IA/ML con Python
├── docs/             # Documentación del proyecto
├── docker-compose.yml # Configuración de contenedores
└── README.md         # Este archivo
```

## Funcionalidades Principales

### 1. Dashboard de Monitoreo en Tiempo Real
- Visualización de estado de red en tiempo real
- Métricas de rendimiento y disponibilidad
- Alertas automáticas de incidencias

### 2. Gestión Automatizada de Incidencias
- Detección automática de problemas
- Clasificación y priorización inteligente
- Asignación automática a técnicos
- Seguimiento del ciclo de vida de incidencias

### 3. Análisis Predictivo con IA
- Predicción de fallos de red
- Análisis de patrones de tráfico
- Recomendaciones de mantenimiento preventivo
- Optimización automática de recursos

### 4. Sistema de Retroalimentación de Clientes
- Portal de reportes de clientes
- Encuestas de satisfacción automatizadas
- Análisis de sentimientos
- Métricas de experiencia del cliente

### 5. Reportes y Analytics
- Dashboards ejecutivos
- Reportes de SLA
- Análisis de tendencias
- Métricas de KPI

## Requisitos del Sistema

### Desarrollo
- Node.js 20.x
- Python 3.11
- PostgreSQL 15+
- Docker Desktop
- Visual Studio Code

### Extensiones Recomendadas para VS Code
- ESLint
- Prettier
- GitLens
- Docker
- PostgreSQL
- Live Server
- Python

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd win-noc-system
```

### 2. Configurar el Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### 3. Configurar el Frontend
```bash
cd frontend
npm install
npm start
```

### 4. Configurar el Módulo de IA
```bash
cd ml-predictor
pip install -r requirements.txt
python app.py
```

### 5. Configurar la Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb win_noc_db
# Ejecutar migraciones
cd backend
npm run migrate
```

## Uso con Docker

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d
```

## Contribución

1. Fork el proyecto
2. Crear una rama para la funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto es propiedad de WIN - Empresa de Telecomunicaciones del Perú.

## Contacto

- **Equipo de Desarrollo**: dev-team@win.pe
- **Arquitecto de Sistemas**: arquitecto@win.pe
- **Soporte Técnico**: soporte@win.pe

---

**Versión**: 1.0.0  
**Última Actualización**: Diciembre 2024