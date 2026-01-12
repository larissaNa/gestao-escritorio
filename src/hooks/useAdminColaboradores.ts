import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { colaboradorService, ColaboradorData } from '@/services/colaboradorService';
import { formularioService } from '@/services/formularioService';
import { adminAuthService } from '@/services/adminAuthService';

export function useAdminColaboradores() {
  const { user, isAdmin } = useAuth();
  const [colaboradores, setColaboradores] = useState<ColaboradorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<ColaboradorData | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para exclusão
  const [userToDelete, setUserToDelete] = useState<ColaboradorData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados para criação de usuário
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('advogado');
  const [creatingUser, setCreatingUser] = useState(false);

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
      setError('Erro ao carregar dados dos colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserName) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setCreatingUser(true);
    try {
      await adminAuthService.createUser(newUserEmail, newUserPassword, newUserName, newUserRole);
      alert('Usuário criado com sucesso!');
      setShowCreateModal(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('advogado');
      loadColaboradores();
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
      alert(errorMessage);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleViewDetails = (colaborador: ColaboradorData) => {
    setSelectedColaborador(colaborador);
    setEditingData(colaborador);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingData(selectedColaborador);
  };

  const handleSave = async () => {
    if (!editingData || !selectedColaborador?.id) return;

    setSaving(true);
    try {
      await formularioService.salvarFormulario(selectedColaborador.id, editingData);
      await loadColaboradores();
      setSelectedColaborador(editingData);
      setIsEditing(false);
      // Aqui poderíamos usar um toast
      alert('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar dados');
    } finally {
      setSaving(false);
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
      if (selectedColaborador?.id === userToDelete.id) {
        setShowModal(false);
        setSelectedColaborador(null);
      }
      
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário. Verifique o console para mais detalhes.');
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleInputChange = (field: keyof ColaboradorData, value: any) => {
    if (!editingData) return;
    setEditingData({
      ...editingData,
      [field]: value
    });
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'advogado': return 'default'; // primary
      case 'recepcao': return 'secondary';
      case 'estagiario': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
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

  return {
    user,
    isAdmin,
    colaboradores,
    loading,
    error,
    selectedColaborador,
    setSelectedColaborador,
    showModal,
    setShowModal,
    showCreateModal,
    setShowCreateModal,
    isEditing,
    setIsEditing,
    editingData,
    setEditingData,
    saving,
    searchTerm,
    setSearchTerm,
    userToDelete,
    setUserToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    deleting,
    newUserEmail,
    setNewUserEmail,
    newUserPassword,
    setNewUserPassword,
    newUserName,
    setNewUserName,
    newUserRole,
    setNewUserRole,
    creatingUser,
    handleCreateUser,
    handleViewDetails,
    handleEdit,
    handleCancelEdit,
    handleSave,
    confirmDelete,
    handleDeleteUser,
    handleInputChange,
    getRoleBadgeVariant,
    formatDate,
    isFormComplete,
    filteredColaboradores
  };
}
