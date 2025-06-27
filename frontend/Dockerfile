# Etapa de construcción
FROM node:20-alpine as build

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Variables de entorno para la construcción
ARG REACT_APP_API_URL=http://localhost:3001/api
ARG REACT_APP_ML_API_URL=http://localhost:5000/api
ARG REACT_APP_VERSION=1.0.0

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ML_API_URL=$REACT_APP_ML_API_URL
ENV REACT_APP_VERSION=$REACT_APP_VERSION
ENV GENERATE_SOURCEMAP=false

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar archivos construidos
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar permisos
RUN chown -R nodejs:nodejs /usr/share/nginx/html && \
    chown -R nodejs:nodejs /var/cache/nginx && \
    chown -R nodejs:nodejs /var/log/nginx && \
    chown -R nodejs:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nodejs:nodejs /var/run/nginx.pid

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Comando de salud
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]