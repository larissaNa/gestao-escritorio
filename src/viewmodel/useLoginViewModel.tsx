import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (err: unknown) {
      setLoading(false);
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setError('Email ou senha incorretos.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Senha incorreta. Tente novamente.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido. Verifique o formato.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Muitas tentativas de login. Tente novamente mais tarde.');
      } else if (error.code === 'auth/user-disabled') {
        setError('Conta desabilitada. Entre em contato com o administrador.');
      } else {
        setError('Falha no login. Verifique suas credenciais e tente novamente.');
      }
      toast.error(error.message || 'Erro ao realizar login');
      console.error('Erro no login:', error);
    }
  };

  const handleResetPassword = async (emailToReset: string) => {
    if (!emailToReset) {
      setError('Por favor, informe seu email para redefinir a senha.');
      return false;
    }

    try {
      setError('');
      setLoading(true);
      await resetPassword(emailToReset);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      setLoading(false);
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/user-not-found') {
        setError('Email não encontrado.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else {
        setError('Erro ao enviar email de redefinição. Tente novamente.');
      }
      toast.error('Erro ao solicitar redefinição de senha');
      console.error('Erro no reset de senha:', error);
      return false;
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    handleSubmit,
    handleResetPassword
  };
};
