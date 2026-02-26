import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="skeleton" style={{ width: '100%', height: '100vh' }} />;
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="skeleton" style={{ width: '100%', height: '100vh' }} />;
  return isAdmin ? <>{children}</> : <Navigate to="/not-authorized" replace />;
}
