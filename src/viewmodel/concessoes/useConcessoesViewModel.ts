import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { concessaoService } from '@/model/services/concessaoService';
import { Concessao, AreaAtuacao } from '@/model/entities';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export const useConcessoes = () => {
  const navigate = useNavigate();
  const [concessoes, setConcessoes] = useState<Concessao[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    tipo: '' as AreaAtuacao | '',
    mesAno: ''
  });

  const carregarConcessoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { concessoes: lista, lastDoc: cursor } = await concessaoService.getConcessoesPaginated(50);
      setConcessoes(lista);
      setLastDoc(cursor || null);
      setHasMore(Boolean(cursor));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar concessões';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao carregar concessões:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarMais = async () => {
    if (!hasMore || !lastDoc) return;
    try {
      setLoadingMore(true);
      const { concessoes: lista, lastDoc: cursor } = await concessaoService.getConcessoesPaginated(50, lastDoc);
      setConcessoes(prev => [...prev, ...lista]);
      setLastDoc(cursor || null);
      setHasMore(Boolean(cursor));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar mais concessões';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao carregar mais concessões:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNew = () => {
    navigate('/concessoes/novo');
  };

  const handleEdit = (concessao: Concessao) => {
    if (concessao.id) {
      navigate(`/concessoes/editar/${concessao.id}`);
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
      await concessaoService.excluirConcessao(deleteId);
      await carregarConcessoes(); // Reload to refresh list
      toast.success('Concessão excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir concessão:', err);
      setError('Erro ao excluir concessão');
      toast.error('Erro ao excluir concessão');
    } finally {
      setDeleteId(null);
    }
  };

  const aplicarFiltros = (novosFiltros: Partial<typeof filtros>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const limparFiltros = () => {
    setFiltros({
      tipo: '',
      mesAno: ''
    });
  };

  const concessoesFiltradas = useMemo(() => {
    return concessoes.filter(concessao => {
      if (filtros.tipo && concessao.tipo !== filtros.tipo) return false;
      if (filtros.mesAno) {
        const [ano, mes] = filtros.mesAno.split('-').map(Number);
        const dataConcessao = concessao.data instanceof Date ? concessao.data : new Date(concessao.data);
        const concessaoAno = dataConcessao.getFullYear();
        const concessaoMes = dataConcessao.getMonth() + 1;
        if (concessaoAno !== ano || concessaoMes !== mes) return false;
      }
      return true;
    });
  }, [concessoes, filtros]);

  const obterOpcoesFiltros = useMemo(() => {
    const tipos = [...new Set(concessoes.map(c => c.tipo))];
    const mesesAno = [...new Set(concessoes.map(c => {
      const data = c.data instanceof Date ? c.data : new Date(c.data);
      return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    }))].sort();

    return {
      tipos,
      mesesAno
    };
  }, [concessoes]);

  useEffect(() => {
    carregarConcessoes();
  }, []);

  return {
    concessoes: concessoesFiltradas,
    loading,
    loadingMore,
    error,
    filtros,
    hasMore,
    handleNew,
    handleEdit,
    confirmDelete,
    cancelDelete,
    executeDelete,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    carregarMais,
    deleteId
  };
};
