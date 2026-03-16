import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserPermission } from '@/model/entities';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, hasFilledForm, canAccessPath } = useAuth();
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

  if (!canAccessPath(location.pathname)) {
    const permissions = user.permissions ?? [];
    const candidates: Array<{ permission: UserPermission; path: string }> = [
      { permission: 'dashboard', path: '/' },
      { permission: 'atendimentos', path: '/atendimentos' },
      { permission: 'relatorios', path: '/relatorio' },
      { permission: 'servicos', path: '/servicos' },
      { permission: 'cadastro', path: '/beneficios' },
      { permission: 'acoes_advogados', path: '/acoes-advogados' },
      { permission: 'processos_advogados', path: '/processos-advogados' },
      { permission: 'financeiro', path: '/financeiro' },
      { permission: 'idas_banco', path: '/idas-banco' },
    ];

    const redirectTo = candidates.find((c) => permissions.includes(c.permission))?.path ?? '/perfil';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
