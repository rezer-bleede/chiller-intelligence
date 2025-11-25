import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [initializing, isAuthenticated, navigate, location.pathname]);

  if (initializing) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
