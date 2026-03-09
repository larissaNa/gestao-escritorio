import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { colaboradorService, ColaboradorData } from '@/model/services/colaboradorService';
import { formularioService } from '@/model/services/formularioService';
import { toast } from 'sonner';

export function usePerfil() {
  const { user, colaboradorName } = useAuth();
  const [profileData, setProfileData] = useState<ColaboradorData | null>(null);
  const [editingData, setEditingData] = useState<ColaboradorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await colaboradorService.getColaboradorByUserId(user.uid);
      setProfileData(data);
      setEditingData(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar dados do perfil');
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingData(profileData);
  };

  const handleSave = async () => {
    if (!editingData || !user) return;

    setSaving(true);
    try {
      await formularioService.salvarFormulario(user.uid, editingData);
      setProfileData(editingData);
      setIsEditing(false);
      // Poderíamos usar um toast aqui
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ColaboradorData, value: ColaboradorData[keyof ColaboradorData]) => {
    if (!editingData) return;
    setEditingData({
      ...editingData,
      [field]: value
    });
  };

  const formatDate = (date: unknown) => {
    if (!date) return '';
    try {
      const dateObj = (date as { toDate?: () => Date }).toDate ? (date as { toDate: () => Date }).toDate() : new Date(date as string | number | Date);
      return dateObj.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };
  
  const formatDateDisplay = (date: unknown) => {
    if (!date) return 'N/A';
    try {
      const dateObj = (date as { toDate?: () => Date }).toDate ? (date as { toDate: () => Date }).toDate() : new Date(date as string | number | Date);
      return dateObj.toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };

  return {
    user,
    colaboradorName,
    profileData,
    editingData,
    loading,
    saving,
    isEditing,
    error,
    handleEdit,
    handleCancelEdit,
    handleSave,
    handleInputChange,
    formatDate,
    formatDateDisplay
  };
}
