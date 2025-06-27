# 🤝 Contribuyendo a WIN NOC System

¡Gracias por tu interés en contribuir al proyecto WIN NOC! Este documento proporciona pautas y información sobre cómo contribuir efectivamente.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Pruebas](#pruebas)
- [Documentación](#documentación)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Funcionalidades](#solicitar-funcionalidades)

## 📜 Código de Conducta

Este proyecto adhiere a un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamientos inaceptables a [dev-team@win.pe](mailto:dev-team@win.pe).

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

Valoramos todos los tipos de contribuciones:

- 🐛 **Reportes de bugs**
- 🆕 **Solicitudes de funcionalidades**
- 📝 **Mejoras en documentación**
- 🔧 **Correcciones de código**
- ✨ **Nuevas funcionalidades**
- 🧪 **Pruebas adicionales**
- 🎨 **Mejoras de UI/UX**

### Proceso de Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. **Realiza** tus cambios
4. **Añade** pruebas para tus cambios
5. **Ejecuta** las pruebas existentes
6. **Commit** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
7. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
8. **Crea** un Pull Request

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos

- **Node.js** 20.x o superior
- **Python** 3.11 o superior
- **PostgreSQL** 15+ (opcional, se puede usar SQLite para desarrollo)
- **Docker** (opcional)
- **Git**

### Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/WIN-NOC-System.git
   cd WIN-NOC-System
   ```

2. **Configura el Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edita .env con tus configuraciones
   npm run dev
   ```

3. **Configura el Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Configura el Módulo de ML:**
   ```bash
   cd ml-predictor
   pip install -r requirements.txt
   python app.py
   ```

5. **Usando Docker (Alternativo):**
   ```bash
   docker-compose up --build
   ```

## 🔄 Proceso de Desarrollo

### Flujo de Git

- **main**: Rama principal, siempre estable
- **develop**: Rama de desarrollo, integración de funcionalidades
- **feature/**: Ramas para nuevas funcionalidades
- **bugfix/**: Ramas para corrección de bugs
- **hotfix/**: Ramas para correcciones urgentes

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(alcance): descripción

[cuerpo opcional]

[pie opcional]
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan el código)
- `refactor`: Refactorización de código
- `test`: Añadir o modificar pruebas
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```
feat(dashboard): agregar gráfico de predicciones en tiempo real
fix(api): corregir error en endpoint de dispositivos
docs(readme): actualizar instrucciones de instalación
```

## 📏 Estándares de Código

### JavaScript/Node.js
- **ESLint** con configuración Airbnb
- **Prettier** para formateo
- **JSDoc** para documentación

### Python
- **PEP 8** para estilo de código
- **Black** para formateo automático
- **Flake8** para linting
- **Type hints** cuando sea posible

### React/Frontend
- **Componentes funcionales** con hooks
- **PropTypes** o **TypeScript** para tipado
- **CSS Modules** o **Tailwind CSS**

### Estructura de Archivos
```
src/
├── components/     # Componentes reutilizables
├── pages/         # Páginas/vistas principales
├── hooks/         # Custom hooks
├── utils/         # Utilidades
├── services/      # Servicios API
├── constants/     # Constantes
└── types/         # Definiciones de tipos
```

## 🧪 Pruebas

### Ejecutar Pruebas

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# ML Predictor
cd ml-predictor && pytest
```

### Cobertura de Pruebas

Mantenemos una cobertura mínima del **80%**:

```bash
# Backend
npm run test:coverage

# Frontend
npm run test:coverage

# ML Predictor
pytest --cov=app
```

### Tipos de Pruebas

- **Unitarias**: Funciones y componentes individuales
- **Integración**: Interacción entre módulos
- **E2E**: Flujos completos de usuario
- **Performance**: Rendimiento y carga

## 📚 Documentación

### Documentar Código

- **Funciones**: JSDoc/Docstrings descriptivos
- **APIs**: Swagger/OpenAPI
- **Componentes**: PropTypes y ejemplos
- **Configuración**: README detallados

### Actualizar Documentación

Al agregar funcionalidades:
1. Actualiza el README principal
2. Documenta nuevas APIs
3. Añade ejemplos de uso
4. Actualiza diagramas si es necesario

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca** en issues existentes
2. **Reproduce** el bug consistentemente
3. **Verifica** en la última versión

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '...'
3. Desplázate hacia '...'
4. Ve el error

**Comportamiento Esperado**
Descripción de lo que esperabas que pasara.

**Screenshots**
Si aplica, añade screenshots.

**Información del Entorno:**
- OS: [ej. Windows 11]
- Navegador: [ej. Chrome 120]
- Versión: [ej. 1.0.0]

**Contexto Adicional**
Cualquier otra información relevante.
```

## ✨ Solicitar Funcionalidades

### Template de Feature Request

```markdown
**¿Tu solicitud está relacionada con un problema?**
Descripción clara del problema.

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Describe alternativas consideradas**
Otras soluciones o funcionalidades consideradas.

**Contexto Adicional**
Screenshots, mockups, o contexto adicional.
```

## 🏷️ Labels y Milestones

### Labels Comunes
- `bug`: Reportes de bugs
- `enhancement`: Nuevas funcionalidades
- `documentation`: Mejoras en documentación
- `good first issue`: Bueno para principiantes
- `help wanted`: Se necesita ayuda
- `priority-high`: Alta prioridad
- `priority-low`: Baja prioridad

## 📞 Contacto

- **Email del equipo**: [dev-team@win.pe](mailto:dev-team@win.pe)
- **Arquitecto de sistemas**: [arquitecto@win.pe](mailto:arquitecto@win.pe)
- **Issues de GitHub**: Para reportes técnicos
- **Discussions**: Para preguntas generales

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la misma licencia del proyecto.

---

¡Gracias por contribuir a WIN NOC System! 🚀