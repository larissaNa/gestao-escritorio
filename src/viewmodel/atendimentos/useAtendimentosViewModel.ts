import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { atendimentoService } from '@/model/services/atendimentoService';
import type { Atendimento, AtendimentoStatus } from '@/model/entities';
import { toast } from 'sonner';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

const normalizeCpf = (cpf: string) => cpf.replace(/\D/g, '');

const isValidDataAtendimento = (d: Date) => Number.isFinite(d.getTime()) && d.getTime() > 0;

const sortByDataAtendimentoDesc = (itens: Atendimento[]) =>
  [...itens].sort((a, b) => b.dataAtendimento.getTime() - a.dataAtendimento.getTime());

const mergeCpfCounts = (prev: Record<string, number>, itens: Atendimento[]) => {
  const next = { ...prev };
  for (const it of itens) {
    const cpf = normalizeCpf(it.clienteCpf);
    if (!cpf) continue;
    next[cpf] = (next[cpf] || 0) + 1;
  }
  return next;
};

const mergeCpfOldestTime = (prev: Record<string, number>, itens: Atendimento[]) => {
  const next = { ...prev };
  for (const it of itens) {
    const cpf = normalizeCpf(it.clienteCpf);
    if (!cpf) continue;
    if (!isValidDataAtendimento(it.dataAtendimento)) continue;
    const t = it.dataAtendimento.getTime();
    const current = next[cpf];
    next[cpf] = current === undefined ? t : Math.min(current, t);
  }
  return next;
};

export const useAtendimentos = () => {
  const navigate = useNavigate();

  // Data State
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cpfCounts, setCpfCounts] = useState<Record<string, number>>({});
  const [cpfOldestTime, setCpfOldestTime] = useState<Record<string, number>>({});
  const [dataMode, setDataMode] = useState<'paginated' | 'year'>('paginated');
  
  // Loading & Error State
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingSemData, setExportingSemData] = useState(false);

  // UI State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingAtendimento, setViewingAtendimento] = useState<Atendimento | null>(null);
  const [advogadoSelecionado, setAdvogadoSelecionado] = useState<Record<string, string>>({});

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponsavel, setFilterResponsavel] = useState('Todos');
  const [filterCidade, setFilterCidade] = useState('Todas');
  const [filterMes, setFilterMes] = useState('');
  const [filterAno, setFilterAno] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState<'Todos' | AtendimentoStatus>('Todos');
  const [filterPendentesFechamento, setFilterPendentesFechamento] = useState<'Todos' | 'Pendentes'>('Todos');
  const [lastCpfQueried, setLastCpfQueried] = useState<string | null>(null);

  // Constants
  const responsaveis = [
    'Dr. Phortus Leonardo', 'Dra. Lara Andrade', 'Dr. Thiago Oliveria',
    'Dra. Janaína Oliveira', 'Dr. Jean Paulo ', 'Brenda', 'Daiane', 'Dr. Thalisson Reinaldo', 'Sofia', 'Arthur', 'Thiago Reinaldo', 'Amanda',
    'Wesllen', 'Jéssica', 'Maria Eduarda'
  ];

  const cidades = ['Piripiri', 'Pedro II'];

  const advogados = [
    'Dra. Lara Andrade', 'Dr. Thiago Oliveria',
    'Dra. Janaína Oliveira', 'Dr. Jean Paulo ', 'Dr. Thalisson Reinaldo'
  ];

  const meses = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
  ];

  const statusOptions: { value: 'Todos' | AtendimentoStatus; label: string }[] = [
    { value: 'Todos', label: 'Todos' },
    { value: 'em_andamento', label: 'Em andamento' },
    { value: 'aguardando_documentacao', label: 'Aguardando documentação' },
    { value: 'repassado', label: 'Repassado' },
    { value: 'fechado_com_contrato', label: 'Fechado com contrato' },
    { value: 'encerrado_sem_contrato', label: 'Encerrado sem contrato' },
    { value: 'finalizado', label: 'Finalizado (legado)' },
  ];

  // Logic
  const isRetorno = (atendimento: Atendimento) => {
    const cpf = normalizeCpf(atendimento.clienteCpf);
    if (!cpf) return false;
    if ((cpfCounts[cpf] || 0) <= 1) return false;
    if (!isValidDataAtendimento(atendimento.dataAtendimento)) return false;
    const oldest = cpfOldestTime[cpf];
    if (oldest === undefined) return false;
    return atendimento.dataAtendimento.getTime() !== oldest;
  };

  const diasDesdeAtendimento = (atendimento: Atendimento) => {
    if (!isValidDataAtendimento(atendimento.dataAtendimento)) return -1;
    const diffMs = Date.now() - atendimento.dataAtendimento.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const isPendenteFechamento = (atendimento: Atendimento) => {
    const fechado = atendimento.status === 'fechado_com_contrato' || Boolean(atendimento.fechamento?.concluidoEm);
    if (fechado) return false;
    return diasDesdeAtendimento(atendimento) >= 0;
  };

  const isAlerta7Dias = (atendimento: Atendimento) => {
    if (!isPendenteFechamento(atendimento)) return false;
    return diasDesdeAtendimento(atendimento) >= 7;
  };

  const carregarAtendimentos = useCallback(async () => {
    try {
      setLoading(true);
      setDataMode('paginated');
      const { itens, lastDoc: cursor } = await atendimentoService.getAtendimentosPaginated(1000);
      setCpfCounts(mergeCpfCounts({}, itens));
      setCpfOldestTime(mergeCpfOldestTime({}, itens));
      setAtendimentos(sortByDataAtendimentoDesc(itens));
      setLastDoc(cursor || null);
      setHasMore(Boolean(cursor));
    } catch (err) {
      console.error('Erro ao carregar atendimentos:', err);
      setError('Erro ao carregar atendimentos');
      toast.error('Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarAtendimentosByYear = useCallback(async (year: number) => {
    try {
      setLoading(true);
      setDataMode('year');
      const itens = await atendimentoService.getAtendimentosByYear(year, 2000);
      setCpfCounts(mergeCpfCounts({}, itens));
      setCpfOldestTime(mergeCpfOldestTime({}, itens));
      setAtendimentos(sortByDataAtendimentoDesc(itens));
      setLastDoc(null);
      setHasMore(false);
    } catch (err) {
      console.error('Erro ao carregar atendimentos do ano:', err);
      setError('Erro ao carregar atendimentos do ano');
      toast.error('Erro ao carregar atendimentos do ano');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filterAno === 'Todos') {
      carregarAtendimentos();
      return;
    }

    const year = parseInt(filterAno);
    if (!Number.isNaN(year)) {
      carregarAtendimentosByYear(year);
    }
  }, [filterAno, carregarAtendimentos, carregarAtendimentosByYear]);

  useEffect(() => {
    const cpfDigits = normalizeCpf(searchTerm);
    if (cpfDigits.length !== 11) {
      setLastCpfQueried(null);
      return;
    }

    if (lastCpfQueried === cpfDigits) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const termo = searchTerm.trim();

        const resultsDirect = termo ? await atendimentoService.getAtendimentosByCpf(termo) : [];
        const resultsFallback =
          resultsDirect.length === 0 && termo !== cpfDigits
            ? await atendimentoService.getAtendimentosByCpf(cpfDigits)
            : [];

        const fetched = [...resultsDirect, ...resultsFallback];
        if (cancelled) return;

        if (fetched.length > 0) {
          setAtendimentos((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const merged = [...prev, ...fetched.filter((it) => !existingIds.has(it.id))];
            return sortByDataAtendimentoDesc(merged);
          });
          setCpfCounts((prev) => mergeCpfCounts(prev, fetched));
          setCpfOldestTime((prev) => mergeCpfOldestTime(prev, fetched));
        }

        setLastCpfQueried(cpfDigits);
      } catch (err) {
        console.error('Erro ao carregar atendimentos por CPF:', err);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, lastCpfQueried]);

  const carregarMais = async () => {
    if (dataMode !== 'paginated') return;
    if (!hasMore || !lastDoc) return;
    try {
      setLoadingMore(true);
      const { itens, lastDoc: cursor } = await atendimentoService.getAtendimentosPaginated(500, lastDoc);
      setCpfCounts(prev => mergeCpfCounts(prev, itens));
      setCpfOldestTime((prev) => mergeCpfOldestTime(prev, itens));
      
      setAtendimentos(prev => {
        const existingIds = new Set(prev.map((p) => p.id));
        const merged = [...prev, ...itens.filter((it) => !existingIds.has(it.id))];
        return sortByDataAtendimentoDesc(merged);
      });

      setLastDoc(cursor || null);
      setHasMore(Boolean(cursor));
    } catch (err) {
      console.error('Erro ao carregar mais atendimentos:', err);
      setError('Erro ao carregar mais atendimentos');
      toast.error('Erro ao carregar mais atendimentos');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRepassar = async (atendimento: Atendimento) => {
    const advogado = advogadoSelecionado[atendimento.id] || '';
    if (!advogado) {
      toast.warning('Selecione um advogado para repassar.');
      return;
    }

    try {
      await atendimentoService.atualizarAtendimento(atendimento.id, {
        advogadoResponsavel: advogado,
        responsavel: advogado,
        status: 'repassado',
        dataAtendimento: atendimento.dataAtendimento
      });

      setAtendimentos(prev =>
        prev.map((item) =>
          item.id === atendimento.id
            ? ({ ...item, advogadoResponsavel: advogado, responsavel: advogado, status: 'repassado' } as Atendimento)
            : item
        )
      );
      toast.success('Atendimento repassado com sucesso!');
    } catch (err) {
      console.error('Erro ao repassar atendimento:', err);
      toast.error('Erro ao repassar atendimento');
      setError('Erro ao repassar atendimento');
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
      await atendimentoService.excluirAtendimento(deleteId);
      toast.success('Atendimento excluído com sucesso!');
      if (filterAno === 'Todos') {
        carregarAtendimentos();
      } else {
        const year = parseInt(filterAno);
        if (!Number.isNaN(year)) {
          carregarAtendimentosByYear(year);
        }
      }
    } catch (err) {
      console.error('Erro ao deletar atendimento:', err);
      toast.error('Erro ao deletar atendimento');
      setError('Erro ao deletar atendimento');
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (atendimento: Atendimento) => {
    navigate(`/atendimentos/editar/${atendimento.id}`);
  };

  const handleFechamento = (atendimento: Atendimento) => {
    navigate(`/atendimentos/editar/${atendimento.id}?tab=fechamento`);
  };

  const handleNew = () => {
    navigate('/atendimentos/novo');
  };

  const handleShowHistory = (cpf: string) => {
    if (!cpf) {
      toast.warning('Este atendimento não possui CPF vinculado para buscar o histórico.');
      return;
    }
    navigate(`/atendimentos/historico/${encodeURIComponent(cpf)}`);
  };

  const handleViewDetails = (atendimento: Atendimento) => {
    setViewingAtendimento(atendimento);
    setShowDetailsModal(true);
  };

  const serializeFirestoreValue = (value: unknown): unknown => {
    if (value === null || value === undefined) return value;
    if (value instanceof Date) return value.toISOString();

    if (typeof value === 'object') {
      if (Array.isArray(value)) return value.map(serializeFirestoreValue);

      const maybeToDate = (value as { toDate?: unknown }).toDate;
      if (typeof maybeToDate === 'function') {
        const d = (value as { toDate: () => Date }).toDate();
        return d instanceof Date && Number.isFinite(d.getTime()) ? d.toISOString() : null;
      }

      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        out[k] = serializeFirestoreValue(v);
      }
      return out;
    }

    return value;
  };


  const searchLower = searchTerm.trim().toLowerCase();
  const searchCpf = normalizeCpf(searchTerm);
  const isCpfSearch = searchCpf.length === 11;

  const filteredAtendimentos = atendimentos.filter(atendimento => {
    const matchesSearch =
      !searchLower ||
      atendimento.clienteNome.toLowerCase().includes(searchLower) ||
      (searchCpf && normalizeCpf(atendimento.clienteCpf).includes(searchCpf));
    const matchesResponsavel = filterResponsavel === 'Todos' || atendimento.responsavel === filterResponsavel;
    const matchesCidade = filterCidade === 'Todas' || atendimento.cidade === filterCidade;
    const matchesMes =
      isCpfSearch || !filterMes || filterMes === 'todos' || atendimento.dataAtendimento.getMonth() === parseInt(filterMes) - 1;
    const matchesAno = isCpfSearch || filterAno === 'Todos' || atendimento.dataAtendimento.getFullYear() === parseInt(filterAno);
    const matchesStatus = filterStatus === 'Todos' || atendimento.status === filterStatus;
    const matchesPendentes =
      filterPendentesFechamento === 'Todos' || (filterPendentesFechamento === 'Pendentes' && isPendenteFechamento(atendimento));

    return matchesSearch && matchesResponsavel && matchesCidade && matchesMes && matchesAno && matchesStatus && matchesPendentes;
  });

  const filteredAtendimentosSorted = sortByDataAtendimentoDesc(filteredAtendimentos);

  const currentYear = new Date().getFullYear();
  const yearsFromData = Array.from(
    new Set(
      atendimentos
        .filter((a) => isValidDataAtendimento(a.dataAtendimento))
        .map((a) => a.dataAtendimento.getFullYear()),
    ),
  );
  const minYear = yearsFromData.length > 0 ? Math.min(...yearsFromData) : currentYear;
  const yearRange = Array.from({ length: currentYear - minYear + 1 }, (_, idx) => currentYear - idx);

  const anos = Array.from(new Set([...yearRange, ...yearsFromData]))
    .sort((a, b) => b - a)
    .map((y) => ({ value: String(y), label: String(y) }));

  return {
    // Data
    atendimentos: filteredAtendimentosSorted,
    responsaveis,
    cidades,
    advogados,
    meses,
    anos,
    
    // UI State
    loading,
    loadingMore,
    hasMore,
    exportingSemData,
    showDetailsModal,
    setShowDetailsModal,
    viewingAtendimento,
    setViewingAtendimento,
    advogadoSelecionado,
    setAdvogadoSelecionado,
    deleteId,

    // Filters
    searchTerm,
    setSearchTerm,
    filterResponsavel,
    setFilterResponsavel,
    filterCidade,
    setFilterCidade,
    filterMes,
    setFilterMes,
    filterAno,
    setFilterAno,
    filterStatus,
    setFilterStatus,
    filterPendentesFechamento,
    setFilterPendentesFechamento,
    statusOptions,
    isRetorno,
    isPendenteFechamento,
    isAlerta7Dias,
    diasDesdeAtendimento,

    // Handlers
    carregarMais,
    handleRepassar,
    confirmDelete,
    cancelDelete,
    executeDelete,
    handleEdit,
    handleNew,
    handleShowHistory,
    handleViewDetails,
    handleFechamento,
  };
};
