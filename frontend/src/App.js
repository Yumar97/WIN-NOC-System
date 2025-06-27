import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Componentes de layout
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Páginas - Lazy loading para mejor rendimiento
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const Incidents = React.lazy(() => import('./pages/Incidents/Incidents'));
const IncidentDetail = React.lazy(() => import('./pages/Incidents/IncidentDetail'));
const CreateIncident = React.lazy(() => import('./pages/Incidents/CreateIncident'));
const Network = React.lazy(() => import('./pages/Network/Network'));
const NetworkDevice = React.lazy(() => import('./pages/Network/NetworkDevice'));
const Analytics = React.lazy(() => import('./pages/Analytics/Analytics'));
const Reports = React.lazy(() => import('./pages/Reports/Reports'));
const Customers = React.lazy(() => import('./pages/Customers/Customers'));
const CustomerDetail = React.lazy(() => import('./pages/Customers/CustomerDetail'));
const Users = React.lazy(() => import('./pages/Users/Users'));
const Profile = React.lazy(() => import('./pages/Profile/Profile'));
const Settings = React.lazy(() => import('./pages/Settings/Settings'));
const NotFound = React.lazy(() => import('./pages/NotFound/NotFound'));

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente para rutas públicas (solo accesibles si no está autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente de fallback para Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Cargando página...</p>
    </div>
  </div>
);

function App() {
  const { theme } = useTheme();

  return (
    <div className={`App ${theme === 'dark' ? 'dark' : ''}`}>
      <Helmet>
        <title>WIN NOC - Centro de Operaciones de Red</title>
        <meta name="description" content="Sistema centralizado de monitoreo y gestión de red para WIN Telecomunicaciones" />
        <meta name="keywords" content="NOC, network operations center, monitoreo de red, telecomunicaciones, WIN" />
        <meta name="author" content="WIN Telecomunicaciones" />
        <meta property="og:title" content="WIN NOC - Centro de Operaciones de Red" />
        <meta property="og:description" content="Sistema centralizado de monitoreo y gestión de red" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Rutas protegidas con layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Incidencias */}
            <Route path="incidents">
              <Route index element={<Incidents />} />
              <Route path="new" element={<CreateIncident />} />
              <Route path=":id" element={<IncidentDetail />} />
            </Route>

            {/* Red y dispositivos */}
            <Route path="network">
              <Route index element={<Network />} />
              <Route path="device/:id" element={<NetworkDevice />} />
            </Route>

            {/* Analytics */}
            <Route path="analytics" element={<Analytics />} />

            {/* Reportes */}
            <Route path="reports" element={<Reports />} />

            {/* Clientes */}
            <Route path="customers">
              <Route index element={<Customers />} />
              <Route path=":id" element={<CustomerDetail />} />
            </Route>

            {/* Usuarios (solo admin y supervisor) */}
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Perfil de usuario */}
            <Route path="profile" element={<Profile />} />

            {/* Configuración (solo admin) */}
            <Route
              path="settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;