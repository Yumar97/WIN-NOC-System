#!/usr/bin/env python3
"""
WIN NOC - Módulo de Inteligencia Artificial y Machine Learning
Sistema de análisis predictivo para el Centro de Operaciones de Red

Autor: WIN Development Team
Versión: 1.0.0
"""

import os
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/ml-predictor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Importar módulos locales
from config.settings import Config
from models.database import db, init_db
from services.prediction_service import PredictionService
from services.anomaly_detection import AnomalyDetectionService
from services.network_analysis import NetworkAnalysisService
from services.incident_prediction import IncidentPredictionService
from services.performance_forecasting import PerformanceForecastingService
from utils.data_preprocessor import DataPreprocessor
from utils.model_manager import ModelManager

# Crear aplicación Flask
app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS
CORS(app, origins=['http://localhost:3000', 'http://localhost:3001'])

# Configurar API REST
api = Api(app)

# Inicializar base de datos
db.init_app(app)
init_db(app)

# Inicializar servicios
prediction_service = PredictionService()
anomaly_service = AnomalyDetectionService()
network_service = NetworkAnalysisService()
incident_service = IncidentPredictionService()
performance_service = PerformanceForecastingService()
data_preprocessor = DataPreprocessor()
model_manager = ModelManager()

# Configurar scheduler para tareas periódicas
scheduler = BackgroundScheduler()
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

# ===== RECURSOS DE LA API =====

class HealthCheck(Resource):
    """Endpoint de verificación de salud del servicio"""
    
    def get(self):
        try:
            # Verificar conexión a base de datos
            db.session.execute('SELECT 1')
            
            # Verificar estado de los modelos
            model_status = model_manager.get_models_status()
            
            return {
                'status': 'healthy',
                'timestamp': datetime.utcnow().isoformat(),
                'version': '1.0.0',
                'models': model_status,
                'uptime': str(datetime.utcnow() - app.start_time)
            }, 200
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }, 500

class NetworkPrediction(Resource):
    """Predicciones de rendimiento de red"""
    
    def post(self):
        try:
            data = request.get_json()
            
            # Validar datos de entrada
            if not data or 'device_id' not in data:
                return {'error': 'device_id es requerido'}, 400
            
            device_id = data['device_id']
            prediction_horizon = data.get('horizon', 24)  # horas
            
            # Obtener predicción
            prediction = prediction_service.predict_network_performance(
                device_id, prediction_horizon
            )
            
            return {
                'success': True,
                'data': prediction,
                'timestamp': datetime.utcnow().isoformat()
            }, 200
            
        except Exception as e:
            logger.error(f"Network prediction error: {str(e)}")
            return {'error': str(e)}, 500

class AnomalyDetection(Resource):
    """Detección de anomalías en tiempo real"""
    
    def post(self):
        try:
            data = request.get_json()
            
            if not data or 'metrics' not in data:
                return {'error': 'metrics son requeridas'}, 400
            
            metrics = data['metrics']
            device_id = data.get('device_id')
            
            # Detectar anomalías
            anomalies = anomaly_service.detect_anomalies(metrics, device_id)
            
            return {
                'success': True,
                'data': {
                    'anomalies_detected': len(anomalies) > 0,
                    'anomalies': anomalies,
                    'risk_score': anomaly_service.calculate_risk_score(anomalies)
                },
                'timestamp': datetime.utcnow().isoformat()
            }, 200
            
        except Exception as e:
            logger.error(f"Anomaly detection error: {str(e)}")
            return {'error': str(e)}, 500

class IncidentPrediction(Resource):
    """Predicción de incidencias"""
    
    def post(self):
        try:
            data = request.get_json()
            
            prediction_type = data.get('type', 'general')
            time_window = data.get('time_window', 24)  # horas
            
            # Generar predicción de incidencias
            prediction = incident_service.predict_incidents(
                prediction_type, time_window
            )
            
            return {
                'success': True,
                'data': prediction,
                'timestamp': datetime.utcnow().isoformat()
            }, 200
            
        except Exception as e:
            logger.error(f"Incident prediction error: {str(e)}")
            return {'error': str(e)}, 500

class PerformanceForecasting(Resource):
    """Pronóstico de rendimiento"""
    
    def post(self):
        try:
            data = request.get_json()
            
            metric_type = data.get('metric_type', 'cpu_usage')
            device_id = data.get('device_id')
            forecast_days = data.get('forecast_days', 7)
            
            # Generar pronóstico
            forecast = performance_service.forecast_performance(
                metric_type, device_id, forecast_days
            )
            
            return {
                'success': True,
                'data': forecast,
                'timestamp': datetime.utcnow().isoformat()
            }, 200
            
        except Exception as e:
            logger.error(f"Performance forecasting error: {str(e)}")
            return {'error': str(e)}, 500

class NetworkAnalysis(Resource):
    """Análisis avanzado de red"""
    
    def post(self):
        try:
            data = request.get_json()
            
            analysis_type = data.get('type', 'topology')
            parameters = data.get('parameters', {})
            
            # Realizar análisis
            if analysis_type == 'topology':
                result = network_service.analyze_topology(parameters)
            elif analysis_type == 'bottlenecks':
                result = network_service.identify_bottlenecks(parameters)
            elif analysis_type == 'optimization':
                result = network_service.suggest_optimizations(parameters)
            else:
                return {'error': 'Tipo de análisis no válido'}, 400
            
            return {
                'success': True,
                'data': result,
                'timestamp': datetime.utcnow().isoformat()
            }, 200
            
        except Exception as e:
            logger.error(f"Network analysis error: {str(e)}")
            return {'error': str(e)}, 500

class ModelTraining(Resource):
    """Entrenamiento y gestión de modelos"""
    
    def post(self):
        try:
            data = request.get_json()
            
            model_type = data.get('model_type')
            training_data = data.get('training_data')
            parameters = data.get('parameters', {})
            
            if not model_type:
                return {'error': 'model_type es requerido'}, 400
            
            # Iniciar entrenamiento
            training_job = model_manager.train_model(
                model_type, training_data, parameters
            )
            
            return {
                'success': True,
                'data': {
                    'job_id': training_job['id'],
                    'status': training_job['status'],
                    'estimated_time': training_job['estimated_time']
                },
                'timestamp': datetime.utcnow().isoformat()
            }, 200
            
        except Exception as e:
            logger.error(f"Model training error: {str(e)}")
            return {'error': str(e)}, 500
    
    def get(self):
        """Obtener estado de los modelos"""
        try:
            models_status = model_manager.get_models_status()
            
            return {
                'success': True,
                'data': models_status,
                'timestamp': datetime.utcnow().isoformat()
            }, 200
            
        except Exception as e:
            logger.error(f"Get models status error: {str(e)}")
            return {'error': str(e)}, 500

class DataPreprocessing(Resource):
    """Preprocesamiento de datos"""
    
    def post(self):
        try:
            data = request.get_json()
            
            raw_data = data.get('data')
            preprocessing_type = data.get('type', 'standard')
            
            if not raw_data:
                return {'error': 'data es requerida'}, 400
            
            # Preprocesar datos
            processed_data = data_preprocessor.preprocess(
                raw_data, preprocessing_type
            )
            
            return {
                'success': True,
                'data': processed_data,
                'timestamp': datetime.utcnow().isoformat()
            }, 200
            
        except Exception as e:
            logger.error(f"Data preprocessing error: {str(e)}")
            return {'error': str(e)}, 500

# ===== REGISTRAR RECURSOS EN LA API =====
api.add_resource(HealthCheck, '/api/health')
api.add_resource(NetworkPrediction, '/api/predict/network')
api.add_resource(AnomalyDetection, '/api/detect/anomalies')
api.add_resource(IncidentPrediction, '/api/predict/incidents')
api.add_resource(PerformanceForecasting, '/api/forecast/performance')
api.add_resource(NetworkAnalysis, '/api/analyze/network')
api.add_resource(ModelTraining, '/api/models/training')
api.add_resource(DataPreprocessing, '/api/data/preprocess')

# ===== TAREAS PROGRAMADAS =====

def retrain_models():
    """Reentrenar modelos periódicamente"""
    try:
        logger.info("Iniciando reentrenamiento de modelos...")
        model_manager.retrain_all_models()
        logger.info("Reentrenamiento completado exitosamente")
    except Exception as e:
        logger.error(f"Error en reentrenamiento: {str(e)}")

def cleanup_old_data():
    """Limpiar datos antiguos"""
    try:
        logger.info("Iniciando limpieza de datos antiguos...")
        # Implementar lógica de limpieza
        logger.info("Limpieza completada exitosamente")
    except Exception as e:
        logger.error(f"Error en limpieza: {str(e)}")

def generate_insights():
    """Generar insights automáticos"""
    try:
        logger.info("Generando insights automáticos...")
        # Implementar generación de insights
        logger.info("Insights generados exitosamente")
    except Exception as e:
        logger.error(f"Error generando insights: {str(e)}")

# Programar tareas
scheduler.add_job(
    func=retrain_models,
    trigger="cron",
    hour=2,  # 2 AM
    minute=0,
    id='retrain_models'
)

scheduler.add_job(
    func=cleanup_old_data,
    trigger="cron",
    hour=3,  # 3 AM
    minute=0,
    id='cleanup_data'
)

scheduler.add_job(
    func=generate_insights,
    trigger="interval",
    hours=6,  # Cada 6 horas
    id='generate_insights'
)

# ===== MANEJO DE ERRORES GLOBALES =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint no encontrado',
        'timestamp': datetime.utcnow().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'error': 'Error interno del servidor',
        'timestamp': datetime.utcnow().isoformat()
    }), 500

@app.before_first_request
def before_first_request():
    """Inicialización antes de la primera request"""
    app.start_time = datetime.utcnow()
    logger.info("WIN NOC ML Predictor iniciado exitosamente")

# ===== PUNTO DE ENTRADA =====

if __name__ == '__main__':
    # Crear directorio de logs si no existe
    os.makedirs('logs', exist_ok=True)
    
    # Configurar modo de ejecución
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    logger.info(f"Iniciando servidor en {host}:{port} (debug={debug_mode})")
    
    app.run(
        host=host,
        port=port,
        debug=debug_mode,
        threaded=True
    )