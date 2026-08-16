import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import LandingPage from '@/src/pages/LandingPage';
import LoginPage from '@/src/pages/LoginPage';
import RegisterPage from '@/src/pages/RegisterPage';
import ForgotPasswordPage from '@/src/pages/ForgotPassword';
import ModuleSelectionPage from '@/src/pages/ModuleSelectionPage';
import AdminLoginPage from '@/src/pages/AdminLoginPage';
import DashboardLayout from '@/src/layouts/DashboardLayout';
import DashboardPage from '@/src/pages/DashboardPage';
import StrategyPage from '@/src/pages/StrategyPage';
import TerritoryPage from '@/src/pages/TerritoryPage';
import CRMPage from '@/src/pages/CRMPage';
import ElectoralPage from '@/src/pages/ElectoralPage';
import UsersManagementPage from '@/src/pages/UsersManagementPage';
import DatabaseSetupPage from '@/src/pages/DatabaseSetupPage';
import { AdminLayout } from '@/src/layouts/AdminLayout';
import AdminDashboardPage from '@/src/pages/admin/AdminDashboardPage';
import AdminClientsPage from '@/src/pages/admin/AdminClientsPage';
import AdministrativeLayout from '@/src/layouts/AdministrativeLayout';
import AdminDashboardView from '@/src/pages/administrative/AdminDashboardPage';
import AdminRolesPage from '@/src/pages/administrative/AdminRolesPage';
import AdminLeadersVotersPage from '@/src/pages/administrative/AdminLeadersVotersPage';
import AdminBudgetCNEPage from '@/src/pages/administrative/AdminBudgetCNEPage';
import AdminCampaignPage from '@/src/pages/administrative/AdminCampaignPage';
import AdminWitnessesPage from '@/src/pages/administrative/AdminWitnessesPage';
import AdminJurorsPage from '@/src/pages/administrative/AdminJurorsPage';
import AdminSurveysPage from '@/src/pages/administrative/AdminSurveysPage';
import AdminSettingsPage from '@/src/pages/administrative/AdminSettingsPage';
import AdminPollingPlaceLookupPage from '@/src/pages/administrative/AdminPollingPlaceLookupPage';
import AdminApiUsagePage from '@/src/pages/administrative/AdminApiUsagePage';
import StrategyPollingPlaceLookupPage from '@/src/pages/strategy/StrategyPollingPlaceLookupPage';
import TerritoryPollingPlaceLookupPage from '@/src/pages/territory/TerritoryPollingPlaceLookupPage';
import PollingPlaceLookupPage from '@/src/pages/PollingPlaceLookupPage';
import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { UserRole } from '@/src/types';

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-module" element={<ModuleSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Dedicated Gestión Administrativa Routes */}
        <Route 
          path="/gestion-administrativa" 
          element={
            <ProtectedRoute requiredModule="ADMINISTRATIVE">
              <AdministrativeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/gestion-administrativa/inicio" replace />} />
          <Route path="inicio" element={<AdminDashboardView />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="lideres-votantes" element={<AdminLeadersVotersPage />} />
          <Route path="presupuesto-cne" element={<AdminBudgetCNEPage />} />
          <Route path="campana" element={<AdminCampaignPage />} />
          <Route path="testigos" element={<AdminWitnessesPage />} />
          <Route path="jurados" element={<AdminJurorsPage />} />
          <Route path="encuestas" element={<AdminSurveysPage />} />
          <Route path="consulta-lugar-votacion" element={<AdminPollingPlaceLookupPage />} />
          <Route path="consumo" element={<AdminApiUsagePage />} />
          <Route path="configuracion" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/gestion-administrativa/inicio" replace />} />
        </Route>

        {/* Friendly Module Route Aliases */}
        <Route path="/administrativa" element={<Navigate to="/gestion-administrativa/inicio" replace />} />
        <Route path="/gestion-territorial" element={<Navigate to="/app/territory" replace />} />
        <Route path="/territorio" element={<Navigate to="/app/territory" replace />} />
        <Route path="/gestion-estrategica" element={<Navigate to="/app/strategy" replace />} />
        <Route path="/estrategia" element={<Navigate to="/app/strategy" replace />} />
        <Route path="/crm" element={<Navigate to="/app/crm" replace />} />
        <Route path="/electoral" element={<Navigate to="/app/electoral" replace />} />
        <Route path="/consulta-lugar-votacion" element={<ProtectedRoute><PollingPlaceLookupPage /></ProtectedRoute>} />
        
        {/* Private Admin Login (Hidden from public) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Protected SuperAdmin Routes - Accessible ONLY at /admin */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="clients" element={<AdminClientsPage />} />
                  <Route path="users" element={<div className="p-8 text-white">Gestión de Usuarios Globales (Próximamente)</div>} />
                  <Route path="plans" element={<div className="p-8 text-white">Planes y Licencias (Próximamente)</div>} />
                  <Route path="modules" element={<div className="p-8 text-white">Módulos y Funciones (Próximamente)</div>} />
                  <Route path="rbac" element={<div className="p-8 text-white">Roles y Permisos Globales (Próximamente)</div>} />
                  <Route path="audit" element={<div className="p-8 text-white">Auditoría Global (Próximamente)</div>} />
                  <Route path="system" element={<div className="p-8 text-white">Configuración del Sistema (Próximamente)</div>} />
                  <Route path="system/database" element={<DatabaseSetupPage />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        {/* Protected App Modules */}
        <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {/* Administrative Management Module Route inside App */}
          <Route path="administrative/*" element={<Navigate to="/gestion-administrativa/inicio" replace />} />
          <Route path="consulta-lugar-votacion" element={<PollingPlaceLookupPage />} />
          
          {/* Territorial Management Module */}
          <Route path="territory" element={
            <ProtectedRoute requiredModule="TERRITORY">
              <TerritoryPage />
            </ProtectedRoute>
          } />
          <Route path="territory/consulta-lugar-votacion" element={
            <ProtectedRoute requiredModule="TERRITORY">
              <TerritoryPollingPlaceLookupPage />
            </ProtectedRoute>
          } />
          
          {/* Strategic Management Module */}
          <Route path="strategy" element={
            <ProtectedRoute requiredModule="STRATEGY">
              <StrategyPage />
            </ProtectedRoute>
          } />
          <Route path="strategy/consulta-lugar-votacion" element={
            <ProtectedRoute requiredModule="STRATEGY">
              <StrategyPollingPlaceLookupPage />
            </ProtectedRoute>
          } />

          {/* CRM / Voter Management */}
          <Route path="crm" element={
            <ProtectedRoute requiredModule="CRM">
              <CRMPage />
            </ProtectedRoute>
          } />

          <Route path="electoral" element={
            <ProtectedRoute requiredModule="ELECTORAL">
              <ElectoralPage />
            </ProtectedRoute>
          } />
          
          <Route path="analysis" element={<ProtectedRoute requiredModule="ANALYSIS"><div className="p-8 text-white">Análisis de Datos y Sondeos</div></ProtectedRoute>} />
          <Route path="communications" element={<ProtectedRoute requiredModule="COMMUNICATIONS"><div className="p-8 text-white">Comunicaciones y Redes</div></ProtectedRoute>} />
          
          {/* Fallback for /app */}
          <Route index element={<Navigate to="/gestion-administrativa/inicio" replace />} />
        </Route>
        
        {/* General Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
