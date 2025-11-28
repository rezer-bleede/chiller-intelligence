import { Navigate, Route, Routes } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { useAuth } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Handle root redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />

      {/* Handle specific auth routes first */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
      />

      {/* Handle all other routes as protected */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
