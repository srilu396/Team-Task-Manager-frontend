import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './queryClient';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import Skeleton from './components/ui/Skeleton';

// Route-based lazy loading
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Team = lazy(() => import('./pages/Team'));
const Settings = lazy(() => import('./pages/Settings'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const Landing = lazy(() => import('./pages/Landing'));

// Layout
import Layout from './components/layout/Layout';

const RouteFallback = () => (
  <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
    <Skeleton className="h-10 w-48 rounded-lg" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-96 rounded-xl" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/my-tasks" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/tasks" element={<AdminRoute><Tasks /></AdminRoute>} />
          <Route path="/my-tasks" element={<MemberDashboard />} />
          <Route path="/team" element={<AdminRoute><Team /></AdminRoute>} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
