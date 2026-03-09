import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { colaboradorService, ColaboradorData } from '@/model/services/colaboradorService';
import { formularioService } from '@/model/services/formularioService';
import { useAuth } from '@/contexts/AuthContext';

export function useEditarColaboradorViewModel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ColaboradorData | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Acesso negado.');
      setError('Acesso negado.');
      setLoading(false);
      return;
    }

    if (id) {
      loadColaborador(id);
    }
  }, [id, isAdmin]);

  const loadColaborador = async (userId: string) => {
    try {
      setLoading(true);
      const data = await colaboradorService.getColaboradorByUserId(userId);
      if (data) {
        setFormData(data);
      } else {
        toast.error('Colaborador não encontrado.');
        setError('Colaborador não encontrado.');
      }
    } catch (err) {
      console.error('Erro ao carregar colaborador:', err);
      toast.error('Erro ao carregar dados do colaborador');
      setError('Erro ao carregar dados do colaborador');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ColaboradorData, value: ColaboradorData[keyof ColaboradorData]) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!formData || !id) return;

    setSaving(true);
    try {
      await formularioService.salvarFormulario(id, formData);
      toast.success('Dados salvos com sucesso!');
      navigate('/admin-colaboradores');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados');
      setError('Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-colaboradores');
  };

  return {
    loading,
    saving,
    error,
    formData,
    handleInputChange,
    handleSave,
    handleCancel
  };
}
