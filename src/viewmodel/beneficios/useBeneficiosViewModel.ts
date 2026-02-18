import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { beneficioService } from '@/model/services/beneficioService';
import { BeneficioItem } from '@/model/entities';

export const useBeneficios = () => {
  const navigate = useNavigate();
  const [beneficios, setBeneficios] = useState<BeneficioItem[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    tipo: '',
    mesAno: ''
  });

  const mapToItem = (beneficio: any): BeneficioItem => ({
    id: beneficio.id,
    nome: beneficio.nome,
    tipo: beneficio.tipo === 'percentual'
        ? 'Administrativo'
        : beneficio.tipo === 'fixo'
        ? 'Judicial'
        : (beneficio.tipo as BeneficioItem['tipo']),
    subtipo: beneficio.descricao || beneficio.subtipo,
    responsavelUID: beneficio.responsavelUID || '',
    responsavelNome: beneficio.responsavelNome || 'Responsável não definido',
    cliente: beneficio.cliente || 'Cliente não definido',
    data: beneficio.data instanceof Date ? beneficio.data : (beneficio.data ? beneficio.data.toDate() : new Date())
  });

  const carregarBeneficios = async () => {
    setLoading(true);
    setError(null);
    try {
      const { beneficios: lista, lastDoc: cursor } = await beneficioService.getBeneficiosPaginated(50);
      setBeneficios(lista.map(mapToItem));
      setLastDoc(cursor || null);
      setHasMore(Boolean(cursor));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar benefícios';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao carregar benefícios:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarMais = async () => {
    if (!hasMore || !lastDoc) return;
    try {
      setLoadingMore(true);
      const { beneficios: lista, lastDoc: cursor } = await beneficioService.getBeneficiosPaginated(50, lastDoc);
      setBeneficios(prev => [...prev, ...lista.map(mapToItem)]);
      setLastDoc(cursor || null);
      setHasMore(Boolean(cursor));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar mais benefícios';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao carregar mais benefícios:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNew = () => {
    navigate('/beneficios/novo');
  };

  const handleEdit = (beneficio: BeneficioItem) => {
    if (beneficio.id) {
      navigate(`/beneficios/editar/${beneficio.id}`);
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
      await beneficioService.excluirBeneficio(deleteId);
      await carregarBeneficios();
      toast.success('Benefício excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir benefício:', err);
      setError('Erro ao excluir benefício');
      toast.error('Erro ao excluir benefício');
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

  const beneficiosFiltrados = useMemo(() => {
    return beneficios.filter(beneficio => {
      if (filtros.tipo && beneficio.tipo !== filtros.tipo) return false;
      if (filtros.mesAno) {
        const [ano, mes] = filtros.mesAno.split('-').map(Number);
        const beneficioAno = beneficio.data.getFullYear();
        const beneficioMes = beneficio.data.getMonth() + 1;
        if (beneficioAno !== ano || beneficioMes !== mes) return false;
      }
      return true;
    });
  }, [beneficios, filtros]);

  const obterOpcoesFiltros = useMemo(() => {
    const tipos = [...new Set(beneficios.map(b => b.tipo))];
    const mesesAno = [...new Set(beneficios.map(b => 
      `${b.data.getFullYear()}-${String(b.data.getMonth() + 1).padStart(2, '0')}`
    ))].sort();

    return {
      tipos,
      mesesAno
    };
  }, [beneficios]);

  useEffect(() => {
    carregarBeneficios();
  }, []);

  return {
    beneficios: beneficiosFiltrados,
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
