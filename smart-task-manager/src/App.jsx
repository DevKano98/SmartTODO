import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout';
import Loading from './components/Loading';

// Lazy load all pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Protected pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Pomodoro = lazy(() => import('./pages/Pomodoro'));
const HabitTracker = lazy(() => import('./pages/HabitTracker'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/pomodoro" element={
            <ProtectedRoute>
              <Layout>
                <Pomodoro />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/habits" element={
            <ProtectedRoute>
              <Layout>
                <HabitTracker />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
