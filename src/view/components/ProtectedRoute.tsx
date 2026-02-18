import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, hasFilledForm } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // RF-ADM-03: Usuários recém-criados não podem usar o sistema até completar o formulário
  // Se o usuário não preencheu o formulário e não está na página do formulário, redirecionar
  if (!hasFilledForm && location.pathname !== '/formulario') {
    return <Navigate to="/formulario" replace />;
  }

  return <>{children}</>;
};
