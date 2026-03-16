import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminAuthService } from '@/model/services/adminAuthService';
import type { UserPermission } from '@/model/entities';

export function useNovoColaboradorViewModel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserType, setNewUserType] = useState<'comum' | 'admin'>('comum');

  const allPermissions: UserPermission[] = [
    'dashboard',
    'atendimentos',
    'relatorios',
    'servicos',
    'cadastro',
    'acoes_advogados',
    'processos_advogados',
    'financeiro',
    'idas_banco',
  ];

  const [newUserPermissions, setNewUserPermissions] = useState<UserPermission[]>(allPermissions);

  const togglePermission = (permission: UserPermission) => {
    setNewUserPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserName) {
      toast.warning('Preencha todos os campos obrigatórios');
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (newUserType === 'comum' && newUserPermissions.length === 0) {
      toast.warning('Selecione pelo menos uma permissão');
      setError('Selecione pelo menos uma permissão');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const role = newUserType === 'admin' ? 'admin' : 'recepcao';
      const permissions = newUserType === 'comum' ? newUserPermissions : undefined;
      await adminAuthService.createUser(newUserEmail, newUserPassword, newUserName, role, permissions);
      toast.success('Usuário criado com sucesso!');
      navigate('/admin-colaboradores');
    } catch (err: unknown) {
      console.error('Erro ao criar usuário:', err);
      let errorMessage = 'Erro ao criar usuário.';
      const error = err as { code?: string };
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-colaboradores');
  };

  return {
    loading,
    error,
    newUserEmail,
    setNewUserEmail,
    newUserPassword,
    setNewUserPassword,
    newUserName,
    setNewUserName,
    newUserType,
    setNewUserType,
    newUserPermissions,
    setNewUserPermissions,
    togglePermission,
    handleCreateUser,
    handleCancel
  };
}
