// WIN NOC System - JavaScript adicional para el dashboard

// Función para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Colores según el tipo
    const colors = {
        'info': '#3b82f6',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para actualizar el estado de conexión
function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.textContent = '🟢 Conectado';
        statusElement.className = 'connection-status online';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('WIN NOC Dashboard iniciado');
    updateConnectionStatus();
});

// Exportar funciones para uso global
window.WinNOC = {
    formatDate,
    showNotification,
    updateConnectionStatus
};