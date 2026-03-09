import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { beneficioService } from '@/model/services/beneficioService';
import { BeneficioItem } from '@/model/entities';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export const useBeneficios = () => {
  const navigate = useNavigate();
  const [beneficios, setBeneficios] = useState<BeneficioItem[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    tipo: '',
    mesAno: ''
  });

  const mapToItem = (beneficio: unknown): BeneficioItem => {
    const b = beneficio as {
      id?: string;
      nome?: string;
      tipo?: string;
      descricao?: string;
      subtipo?: string;
      responsavelUID?: string;
      responsavelNome?: string;
      cliente?: string;
      data?: Date | { toDate?: () => Date };
      dataCriacao?: Date | { toDate?: () => Date };
    };
    const tipoFinal: BeneficioItem['tipo'] =
      b.tipo === 'percentual' ? 'Administrativo' :
      b.tipo === 'fixo' ? 'Judicial' :
      (b.tipo as BeneficioItem['tipo']);
    const dataFinal =
      b.data instanceof Date
        ? b.data
        : b.data && (b.data as { toDate?: () => Date }).toDate
        ? (b.data as { toDate: () => Date }).toDate()
        : new Date();
    const dataCriacaoFinal =
      b.dataCriacao instanceof Date
        ? b.dataCriacao
        : b.dataCriacao && (b.dataCriacao as { toDate?: () => Date }).toDate
        ? (b.dataCriacao as { toDate: () => Date }).toDate()
        : dataFinal;
    return {
      id: String(b.id || ''),
      nome: String(b.nome || ''),
      tipo: tipoFinal,
      subtipo: String(b.descricao || b.subtipo || ''),
      responsavelUID: String(b.responsavelUID || ''),
      responsavelNome: String(b.responsavelNome || 'Responsável não definido'),
      cliente: String(b.cliente || 'Cliente não definido'),
      dataCriacao: dataCriacaoFinal,
      data: dataFinal,
    };
  };

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
