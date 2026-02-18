import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { processoAdvogadoService } from '@/model/services/processoAdvogadoService';
import { ProcessoAdvogado } from '@/model/entities';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useProcessosViewModel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [processos, setProcessos] = useState<ProcessoAdvogado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      carregar();
    }
  }, [user]);

  const carregar = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await processoAdvogadoService.list(user.uid, isAdmin);
      setProcessos(data);
    } catch (err) {
      console.error('Erro ao carregar processos de advogados', err);
      toast.error('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProcessos = useMemo(() => {
    let result = processos;

    if (filterArea && filterArea !== 'all') {
      result = result.filter(p => p.areaAtuacao === filterArea);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nomeAdvogado.toLowerCase().includes(lower) || 
        p.areaAtuacao.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [processos, searchTerm, filterArea]);

  const graficoExito = useMemo(() => {
    const { exito, naoExito } = processoAdvogadoService.calcularExito(processos);
    const total = exito + naoExito || 1;
    return {
      data: [
        { name: 'Êxito', value: exito, color: '#22c55e' },
        { name: 'Não êxito', value: naoExito, color: '#6b7280' }
      ],
      resumo: { exito, naoExito, percentualExito: ((exito / total) * 100).toFixed(1) }
    };
  }, [processos]);

  const handleEdit = (id: string) => {
    navigate(`/processos-advogados/editar/${id}`);
  };

  const handleNew = () => {
    navigate('/processos-advogados/novo');
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
      await processoAdvogadoService.delete(deleteId);
      toast.success('Registro excluído com sucesso');
      await carregar();
    } catch (err) {
      console.error('Erro ao excluir processo', err);
      toast.error('Erro ao excluir registro');
    } finally {
      setDeleteId(null);
    }
  };

  return {
    processos: filteredProcessos,
    loading,
    searchTerm,
    setSearchTerm,
    filterArea,
    setFilterArea,
    graficoExito,
    user,
    isAdmin,
    handleEdit,
    handleNew,
    refresh: carregar,
    deleteId,
    confirmDelete,
    cancelDelete,
    executeDelete
  };
}
