import { Navigate, Route, Routes } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import AuthRoutes from './routes/AuthRoutes';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { useAuth } from './store/authStore';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route element={<AuthRoutes />} />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/*" element={<AppRoutes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
