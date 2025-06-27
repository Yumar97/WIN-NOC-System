#!/usr/bin/env python3
"""
WIN NOC - Sistema Simplificado
Centro de Operaciones de Red para WIN Telecomunicaciones
"""

from flask import Flask, render_template, jsonify, request, redirect, url_for, session
import json
import sqlite3
import os
from datetime import datetime, timedelta
import random
import threading
import time

app = Flask(__name__)
app.secret_key = 'win-noc-secret-2024'

# Configuración
DATABASE = 'win_noc.db'
app.config['DATABASE'] = DATABASE

# Datos simulados en memoria
network_devices = [
    {'id': 1, 'name': 'Router Principal Lima', 'ip': '192.168.1.1', 'status': 'online', 'cpu': 45, 'memory': 67, 'location': 'Lima Centro'},
    {'id': 2, 'name': 'Switch Core Callao', 'ip': '192.168.1.2', 'status': 'online', 'cpu': 32, 'memory': 54, 'location': 'Callao'},
    {'id': 3, 'name': 'Firewall Perimetral', 'ip': '192.168.1.3', 'status': 'warning', 'cpu': 78, 'memory': 89, 'location': 'Lima Norte'},
    {'id': 4, 'name': 'Router Arequipa', 'ip': '192.168.2.1', 'status': 'offline', 'cpu': 0, 'memory': 0, 'location': 'Arequipa'},
    {'id': 5, 'name': 'Switch Trujillo', 'ip': '192.168.3.1', 'status': 'online', 'cpu': 23, 'memory': 41, 'location': 'Trujillo'},
]

incidents = [
    {'id': 1, 'title': 'Caída de Router Arequipa', 'status': 'open', 'priority': 'critical', 'created': '2024-12-26 10:30', 'assigned': 'Juan Pérez'},
    {'id': 2, 'title': 'Alto uso de CPU en Firewall', 'status': 'in_progress', 'priority': 'high', 'created': '2024-12-26 11:15', 'assigned': 'María García'},
    {'id': 3, 'title': 'Latencia elevada en Lima Norte', 'status': 'resolved', 'priority': 'medium', 'created': '2024-12-26 09:45', 'assigned': 'Carlos López'},
]

customers = [
    {'id': 1, 'name': 'Empresa ABC SAC', 'plan': 'Corporativo', 'status': 'active', 'satisfaction': 4.2},
    {'id': 2, 'name': 'Retail XYZ EIRL', 'plan': 'Empresarial', 'status': 'active', 'satisfaction': 4.7},
    {'id': 3, 'name': 'Gobierno Regional', 'plan': 'Gubernamental', 'status': 'active', 'satisfaction': 3.8},
]

# Función para simular datos en tiempo real
def update_metrics():
    while True:
        for device in network_devices:
            if device['status'] == 'online':
                device['cpu'] = max(10, min(95, device['cpu'] + random.randint(-5, 5)))
                device['memory'] = max(20, min(95, device['memory'] + random.randint(-3, 3)))
                
                # Cambiar estado basado en métricas
                if device['cpu'] > 90 or device['memory'] > 90:
                    device['status'] = 'critical'
                elif device['cpu'] > 80 or device['memory'] > 80:
                    device['status'] = 'warning'
                else:
                    device['status'] = 'online'
        
        time.sleep(10)  # Actualizar cada 10 segundos

# Iniciar hilo para actualización de métricas
metrics_thread = threading.Thread(target=update_metrics, daemon=True)
metrics_thread.start()

# Rutas principales
@app.route('/')
def index():
    return render_template('dashboard.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Validación simple
    if username == 'admin' and password == 'admin123':
        session['user'] = {'username': username, 'role': 'admin'}
        return jsonify({'success': True, 'message': 'Login exitoso'})
    else:
        return jsonify({'success': False, 'message': 'Credenciales inválidas'}), 401

@app.route('/api/dashboard/overview')
def dashboard_overview():
    online_devices = len([d for d in network_devices if d['status'] == 'online'])
    total_devices = len(network_devices)
    open_incidents = len([i for i in incidents if i['status'] == 'open'])
    avg_satisfaction = sum([c['satisfaction'] for c in customers]) / len(customers)
    
    return jsonify({
        'devices_online': online_devices,
        'devices_total': total_devices,
        'availability': round((online_devices / total_devices) * 100, 1),
        'open_incidents': open_incidents,
        'avg_satisfaction': round(avg_satisfaction, 1),
        'network_health': 'Good' if online_devices > total_devices * 0.8 else 'Warning'
    })

@app.route('/api/devices')
def api_devices():
    return jsonify(network_devices)

@app.route('/api/incidents')
def api_incidents():
    return jsonify(incidents)

@app.route('/api/customers')
def api_customers():
    return jsonify(customers)

@app.route('/api/incidents', methods=['POST'])
def create_incident():
    data = request.get_json()
    new_incident = {
        'id': len(incidents) + 1,
        'title': data.get('title'),
        'status': 'open',
        'priority': data.get('priority', 'medium'),
        'created': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'assigned': data.get('assigned', 'Sin asignar')
    }
    incidents.append(new_incident)
    return jsonify({'success': True, 'incident': new_incident})

@app.route('/api/predict/network')
def predict_network():
    # Simulación de predicción con IA
    predictions = []
    for device in network_devices:
        if device['status'] == 'online':
            # Simular predicción de CPU para las próximas 24 horas
            future_cpu = []
            current_cpu = device['cpu']
            for hour in range(24):
                # Simular patrón diario con algo de ruido
                base_pattern = 50 + 20 * abs(((hour - 12) / 12))  # Patrón en U
                noise = random.randint(-10, 10)
                predicted_cpu = max(10, min(95, base_pattern + noise))
                future_cpu.append(predicted_cpu)
            
            predictions.append({
                'device_id': device['id'],
                'device_name': device['name'],
                'current_cpu': current_cpu,
                'predicted_cpu': future_cpu,
                'risk_level': 'high' if max(future_cpu) > 85 else 'medium' if max(future_cpu) > 70 else 'low'
            })
    
    return jsonify({'predictions': predictions})

@app.route('/api/analytics/incidents')
def analytics_incidents():
    # Simular datos de análisis de incidencias
    last_30_days = []
    for i in range(30):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        incidents_count = random.randint(0, 5)
        last_30_days.append({'date': date, 'incidents': incidents_count})
    
    return jsonify({
        'daily_incidents': last_30_days,
        'by_priority': {
            'critical': random.randint(5, 15),
            'high': random.randint(10, 25),
            'medium': random.randint(20, 40),
            'low': random.randint(15, 30)
        },
        'resolution_time': {
            'avg_hours': round(random.uniform(2.5, 8.5), 1),
            'sla_compliance': round(random.uniform(85, 95), 1)
        }
    })

if __name__ == '__main__':
    # Crear directorio de templates si no existe
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("🚀 Iniciando WIN NOC - Centro de Operaciones de Red")
    print("📊 Dashboard disponible en: http://localhost:5000")
    print("👤 Usuario: admin | Contraseña: admin123")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)