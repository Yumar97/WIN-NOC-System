import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

import { authAPI } from '../services/api';

// Estados iniciales
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  accessToken: null,
  refreshToken: null,
};

// Tipos de acciones
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
      return {
        ...initialState,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext();

// Constantes para cookies
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  expires: 7, // 7 días
};

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función para guardar tokens en cookies
  const saveTokens = (accessToken, refreshToken) => {
    Cookies.set('accessToken', accessToken, COOKIE_OPTIONS);
    Cookies.set('refreshToken', refreshToken, COOKIE_OPTIONS);
  };

  // Función para limpiar tokens de cookies
  const clearTokens = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  };

  // Función para inicializar la autenticación desde cookies
  const initializeAuth = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');

      if (!accessToken || !refreshToken) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      // Verificar si el token es válido obteniendo información del usuario
      const response = await authAPI.getMe(accessToken);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      // Si el token de acceso ha expirado, intentar renovarlo
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          await refreshAccessToken();
        } catch (refreshError) {
          clearTokens();
          dispatch({
            type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
            payload: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          });
        }
      } else {
        clearTokens();
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    }
  };

  // Función para renovar el token de acceso
  const refreshAccessToken = async () => {
    try {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshToken);
      const { access_token, refresh_token } = response.data;

      saveTokens(access_token, refresh_token);
      
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
        payload: {
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      });

      return access_token;
    } catch (error) {
      clearTokens();
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
        payload: error.response?.data?.message || 'Error al renovar la sesión',
      });
      throw error;
    }
  };

  // Función para iniciar sesión
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authAPI.login(credentials);
      const { user, access_token, refresh_token } = response.data;

      saveTokens(access_token, refresh_token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      });

      toast.success(`¡Bienvenido, ${user.first_name}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      // Intentar notificar al servidor sobre el logout
      if (state.accessToken) {
        await authAPI.logout(state.accessToken);
      }
    } catch (error) {
      // Ignorar errores del servidor durante logout
      console.warn('Error during logout:', error);
    } finally {
      clearTokens();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Sesión cerrada correctamente');
    }
  };

  // Función para actualizar información del usuario
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return state.user?.role === role || state.user?.role === 'admin';
  };

  // Función para verificar si el usuario tiene permisos específicos
  const hasPermission = (permission) => {
    const rolePermissions = {
      admin: ['all'],
      supervisor: ['read_all', 'write_incidents', 'assign_incidents', 'view_reports', 'manage_team'],
      technician: ['read_incidents', 'update_incidents', 'read_devices', 'update_devices'],
      analyst: ['read_all', 'view_reports', 'analyze_data'],
      viewer: ['read_incidents', 'read_devices', 'read_customers'],
    };

    const userPermissions = rolePermissions[state.user?.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  // Efecto para inicializar la autenticación al cargar la aplicación
  useEffect(() => {
    initializeAuth();
  }, []);

  // Efecto para configurar interceptor de axios para renovación automática de tokens
  useEffect(() => {
    if (state.accessToken) {
      // Configurar interceptor para agregar token a las requests
      const requestInterceptor = authAPI.interceptors.request.use(
        (config) => {
          if (state.accessToken) {
            config.headers.Authorization = `Bearer ${state.accessToken}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Configurar interceptor para manejar respuestas 401
      const responseInterceptor = authAPI.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
              const newAccessToken = await refreshAccessToken();
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return authAPI(originalRequest);
            } catch (refreshError) {
              logout();
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        }
      );

      // Cleanup interceptors
      return () => {
        authAPI.interceptors.request.eject(requestInterceptor);
        authAPI.interceptors.response.eject(responseInterceptor);
      };
    }
  }, [state.accessToken]);

  // Valor del contexto
  const contextValue = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    accessToken: state.accessToken,

    // Funciones
    login,
    logout,
    updateUser,
    clearError,
    hasRole,
    hasPermission,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;