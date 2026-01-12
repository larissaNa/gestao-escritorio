import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { colaboradorService, ColaboradorData } from '@/services/colaboradorService';
import { formularioService } from '@/services/formularioService';

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
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ColaboradorData, value: any) => {
    if (!editingData) return;
    setEditingData({
      ...editingData,
      [field]: value
    });
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };
  
  const formatDateDisplay = (date: any) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
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
