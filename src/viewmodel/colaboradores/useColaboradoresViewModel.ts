import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { colaboradorService, ColaboradorData } from '@/model/services/colaboradorService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { BadgeProps } from '@/view/components/ui/badge';

export function useColaboradoresViewModel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState<ColaboradorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para exclusão
  const [userToDelete, setUserToDelete] = useState<ColaboradorData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setError('Acesso negado. Apenas administradores podem visualizar esta página.');
      setLoading(false);
      return;
    }

    loadColaboradores();
  }, [isAdmin]);

  const loadColaboradores = async () => {
    try {
      setLoading(true);
      const data = await colaboradorService.getAllColaboradores();
      setColaboradores(data);
    } catch (err) {
      console.error('Erro ao carregar colaboradores:', err);
      toast.error('Erro ao carregar dados dos colaboradores');
      setError('Erro ao carregar dados dos colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (colaborador: ColaboradorData) => {
    setUserToDelete(colaborador);
    setShowDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete.id) return;

    setDeleting(true);
    try {
      await colaboradorService.deleteColaborador(userToDelete.id);
      
      // Atualizar lista local
      setColaboradores(colaboradores.filter(c => c.id !== userToDelete.id));
      
      // Fechar modais
      setShowDeleteDialog(false);
      
      toast.success('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário.');
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  const getRoleBadgeVariant = (role?: string): BadgeProps['variant'] => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'advogado': return 'default'; // primary
      case 'recepcao': return 'secondary';
      case 'estagiario': return 'outline';
      default: return 'secondary';
    }
  };

  const isFormComplete = (colaborador: ColaboradorData) => {
    const camposObrigatorios = ['primeiroNome', 'sobreNome', 'cpf', 'funcaoCargo', 'departamento'];
    return camposObrigatorios.every(campo => 
      colaborador[campo as keyof ColaboradorData] && 
      String(colaborador[campo as keyof ColaboradorData]).trim() !== ''
    );
  };

  const filteredColaboradores = colaboradores.filter(colab => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${colab.primeiroNome || ''} ${colab.sobreNome || ''}`.toLowerCase();
    const email = (colab.email || '').toLowerCase();
    const cpf = (colab.cpf || '').toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower) || cpf.includes(searchLower);
  });

  const navigateToCreate = () => {
    navigate('/admin-colaboradores/novo');
  };

  const navigateToEdit = (id: string) => {
    navigate(`/admin-colaboradores/editar/${id}`);
  };

  return {
    user,
    isAdmin,
    colaboradores,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    userToDelete,
    setUserToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    deleting,
    confirmDelete,
    handleDeleteUser,
    getRoleBadgeVariant,
    isFormComplete,
    filteredColaboradores,
    navigateToCreate,
    navigateToEdit,
    loadColaboradores
  };
}
