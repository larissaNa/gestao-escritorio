import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { caminhoClienteService } from '@/model/services/caminhoClienteService';
import {
  CaminhoCliente,
  EtapaCaminho,
  SituacaoCaminho,
  SetorResponsavel,
} from '@/model/entities';

export function useCaminhoClienteViewModel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [caminhos, setCaminhos] = useState<CaminhoCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState<EtapaCaminho | 'all'>('all');
  const [filterSituacao, setFilterSituacao] = useState<SituacaoCaminho | 'all'>('all');
  const [filterSetor, setFilterSetor] = useState<SetorResponsavel | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) carregar();
  }, [user]);

  const carregar = async () => {
    try {
      setLoading(true);
      const data = await caminhoClienteService.list();
      setCaminhos(data);
    } catch (err) {
      console.error('Erro ao carregar caminho do cliente', err);
      toast.error('Erro ao carregar registros');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = caminhos;

    if (filterEtapa !== 'all') result = result.filter((c) => c.etapaAtual === filterEtapa);
    if (filterSituacao !== 'all') result = result.filter((c) => c.situacao === filterSituacao);
    if (filterSetor !== 'all') result = result.filter((c) => c.setorResponsavel === filterSetor);

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.clienteNome?.toLowerCase().includes(lower) ||
          c.clienteCpf?.toLowerCase().includes(lower) ||
          c.numeroProcessoAdm?.toLowerCase().includes(lower) ||
          c.numeroProcessoJud?.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [caminhos, searchTerm, filterEtapa, filterSituacao, filterSetor]);

  const resumo = useMemo(() => {
    const total = caminhos.length;
    const concluidos = caminhos.filter((c) => c.situacao === 'concluido').length;
    const parados7d = caminhos.filter(
      (c) => caminhoClienteService.diasParado(c) >= 7 && c.situacao !== 'concluido'
    ).length;
    const parados15d = caminhos.filter(
      (c) => caminhoClienteService.diasParado(c) >= 15 && c.situacao !== 'concluido'
    ).length;
    return { total, concluidos, parados7d, parados15d };
  }, [caminhos]);

  const handleNew = () => navigate('/caminho-cliente/novo');
  const handleEdit = (id: string) => navigate(`/caminho-cliente/editar/${id}`);
  const handleTimeline = (id: string) => navigate(`/caminho-cliente/${id}`);

  const confirmDelete = (id: string) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);
  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await caminhoClienteService.delete(deleteId);
      toast.success('Registro excluído');
      await carregar();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir registro');
    } finally {
      setDeleteId(null);
    }
  };

  return {
    caminhos: filtered,
    todosCaminhos: caminhos,
    loading,
    searchTerm,
    setSearchTerm,
    filterEtapa,
    setFilterEtapa,
    filterSituacao,
    setFilterSituacao,
    filterSetor,
    setFilterSetor,
    resumo,
    handleNew,
    handleEdit,
    handleTimeline,
    refresh: carregar,
    deleteId,
    confirmDelete,
    cancelDelete,
    executeDelete,
  };
}
