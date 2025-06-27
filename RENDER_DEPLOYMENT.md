# 🚀 Despliegue en Render - WIN NOC System

## 📋 Guía de Configuración para Render

### 🔧 **Opción 1: Despliegue Web Service (Recomendado)**

1. **Conecta tu repositorio:**
   - Ve a [Render Dashboard](https://dashboard.render.com/)
   - Haz clic en "New +" → "Web Service"
   - Conecta tu repositorio GitHub: `https://github.com/Yumar97/WIN-NOC-System`

2. **Configuración del servicio:**
   ```
   Name: win-noc-system
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python win_noc_server.py
   ```

3. **Variables de entorno:**
   ```
   FLASK_ENV=production
   PYTHONUNBUFFERED=1
   ```

4. **Configuración avanzada:**
   - **Health Check Path:** `/`
   - **Auto-Deploy:** Yes
   - **Instance Type:** Free (para pruebas) o Starter ($7/mes)

### 🐳 **Opción 2: Despliegue con Docker**

Si prefieres usar Docker:

1. **En Render Dashboard:**
   - Selecciona "Web Service"
   - Conecta tu repositorio
   - Environment: Docker

2. **Configuración Docker:**
   ```
   Dockerfile Path: ./Dockerfile
   Docker Context: .
   ```

### 🔄 **Opción 3: Usando render.yaml (Blueprint)**

1. **Fork y configura:**
   - Asegúrate de que `render.yaml` esté en la raíz
   - En Render: "New +" → "Blueprint"
   - Conecta tu repositorio

### 📊 **Variables de Entorno Requeridas**

```bash
# Producción
FLASK_ENV=production
PYTHONUNBUFFERED=1

# Opcional - para base de datos futura
# DATABASE_URL=postgresql://...
```

### 🌐 **URLs de Acceso**

Una vez desplegado:
- **URL principal:** `https://tu-servicio.onrender.com`
- **Dashboard:** `https://tu-servicio.onrender.com/`
- **Login:** `https://tu-servicio.onrender.com/login`

### 👤 **Credenciales de Acceso**

```
Usuario: admin
Contraseña: admin123
```

### 🔍 **Verificación del Despliegue**

1. **Verifica que el servicio esté corriendo:**
   ```bash
   curl https://tu-servicio.onrender.com/api/dashboard/overview
   ```

2. **Revisa los logs en Render Dashboard**

3. **Prueba el login y dashboard**

### ⚠️ **Limitaciones del Plan Gratuito**

- **Sleep después de 15 minutos de inactividad**
- **750 horas/mes de tiempo activo**
- **Arranque lento después del sleep (~30 segundos)**

### 🚀 **Optimizaciones para Producción**

1. **Upgrade a plan pagado** para evitar sleep
2. **Configura dominio personalizado**
3. **Añade SSL certificate** (automático en Render)
4. **Configura monitoring y alertas**

### 🔧 **Troubleshooting Común**

#### Error: "Application failed to start"
```bash
# Verifica logs en Render Dashboard
# Asegúrate de que requirements.txt esté correcto
# Verifica que el puerto sea dinámico (PORT env var)
```

#### Error: "Build failed"
```bash
# Verifica que Python 3.11 sea compatible
# Revisa requirements.txt por dependencias problemáticas
# Usa pip freeze > requirements.txt para generar dependencias exactas
```

#### Error: "Health check failed"
```bash
# Asegúrate de que la app responda en la ruta "/"
# Verifica que el puerto sea el correcto (os.environ.get('PORT'))
```

### 📈 **Monitoreo y Métricas**

Render proporciona:
- **Métricas de CPU y memoria**
- **Logs en tiempo real**
- **Health checks automáticos**
- **Alertas por email**

### 🔄 **CI/CD Automático**

Con la configuración actual:
- **Auto-deploy** en cada push a main
- **Build automático** con GitHub Actions
- **Rollback** fácil desde Render Dashboard

### 📞 **Soporte**

Si tienes problemas:
1. **Revisa logs** en Render Dashboard
2. **Consulta documentación** de Render
3. **Contacta soporte** de Render si es necesario

---

## 🎯 **Pasos Rápidos para Desplegar**

1. **Commit y push** los cambios recientes
2. **Ve a Render.com** y crea cuenta
3. **New Web Service** → Conecta GitHub
4. **Selecciona repositorio** WIN-NOC-System
5. **Configura:**
   - Build: `pip install -r requirements.txt`
   - Start: `python win_noc_server.py`
   - Environment: Python 3
6. **Deploy** y espera ~5 minutos
7. **Accede** a tu URL de Render

¡Tu WIN NOC System estará disponible en la web! 🌐