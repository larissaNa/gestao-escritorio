import { useState, useEffect } from 'react';
import { idasBancoService } from '@/model/services/idasBancoService';
import { IdaBanco } from '@/model/entities';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useIdasViewModel() {
  const navigate = useNavigate();
  const [idas, setIdas] = useState<IdaBanco[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadIdas();
  }, []);

  const loadIdas = async () => {
    try {
      setLoading(true);
      const data = await idasBancoService.getIdas();
      setIdas(data);
    } catch (error) {
      console.error('Erro ao carregar idas:', error);
      toast.error('Erro ao carregar idas ao banco.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await idasBancoService.deleteIda(deleteId);
      toast.success('Registro excluído com sucesso!');
      loadIdas();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir registro.');
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/idas-banco/editar/${id}`);
  };

  const handleNew = () => {
    navigate('/idas-banco/nova');
  };

  const filteredIdas = idas.filter(ida => 
    ida.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ida.responsavelNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ida.banco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    loading,
    searchTerm,
    setSearchTerm,
    filteredIdas,
    confirmDelete,
    cancelDelete,
    executeDelete,
    deleteId,
    handleEdit,
    handleNew,
    refresh: loadIdas
  };
}
