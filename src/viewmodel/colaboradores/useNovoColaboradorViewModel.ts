import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminAuthService } from '@/model/services/adminAuthService';

export function useNovoColaboradorViewModel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('advogado');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserName) {
      toast.warning('Preencha todos os campos obrigatórios');
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await adminAuthService.createUser(newUserEmail, newUserPassword, newUserName, newUserRole);
      toast.success('Usuário criado com sucesso!');
      navigate('/admin-colaboradores');
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      let errorMessage = 'Erro ao criar usuário.';
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
    newUserRole,
    setNewUserRole,
    handleCreateUser,
    handleCancel
  };
}
