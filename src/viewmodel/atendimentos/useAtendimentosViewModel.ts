import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { atendimentoService } from '@/model/services/atendimentoService';
import { Atendimento } from '@/model/entities';
import { toast } from 'sonner';

export const useAtendimentos = () => {
  const navigate = useNavigate();

  // Data State
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [clienteHistory, setClienteHistory] = useState<Atendimento[]>([]);
  
  // Loading & Error State
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingAtendimento, setViewingAtendimento] = useState<Atendimento | null>(null);
  const [advogadoSelecionado, setAdvogadoSelecionado] = useState<Record<string, string>>({});

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponsavel, setFilterResponsavel] = useState('Todos');
  const [filterCidade, setFilterCidade] = useState('Todas');
  const [filterMes, setFilterMes] = useState('');

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

  // Logic
  const processAtendimentosUnicos = (itens: Atendimento[], accInitial: Atendimento[] = []) => {
    return itens.reduce((acc, current) => {
      const cpf = current.clienteCpf.replace(/\D/g, '');
      if (!cpf) return [...acc, current];
      
      const existingIndex = acc.findIndex(item => item.clienteCpf.replace(/\D/g, '') === cpf);
      
      if (existingIndex === -1) {
        return [...acc, current];
      } else {
        if (current.dataAtendimento > acc[existingIndex].dataAtendimento) {
          const newAcc = [...acc];
          newAcc[existingIndex] = current;
          return newAcc;
        }
      }
      return acc;
    }, accInitial);
  };

  const carregarAtendimentos = useCallback(async () => {
    try {
      setLoading(true);
      const { itens, lastDoc: cursor } = await atendimentoService.getAtendimentosPaginated(300);
      const atendimentosUnicos = processAtendimentosUnicos(itens);
      setAtendimentos(atendimentosUnicos);
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

  useEffect(() => {
    carregarAtendimentos();
  }, [carregarAtendimentos]);

  const carregarMais = async () => {
    if (!hasMore || !lastDoc) return;
    try {
      setLoadingMore(true);
      const { itens, lastDoc: cursor } = await atendimentoService.getAtendimentosPaginated(100, lastDoc);
      
      setAtendimentos(prev => {
         return itens.reduce((acc, current) => {
          const cpf = current.clienteCpf.replace(/\D/g, '');
          if (!cpf) return [...acc, current];
          
          const existingIndex = acc.findIndex(item => item.clienteCpf.replace(/\D/g, '') === cpf);
          
          if (existingIndex === -1) {
            return [...acc, current];
          } else {
            if (current.dataAtendimento > acc[existingIndex].dataAtendimento) {
              const newAcc = [...acc];
              newAcc[existingIndex] = current;
              return newAcc;
            }
          }
          return acc;
        }, prev);
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
        status: 'em_andamento',
        dataAtendimento: atendimento.dataAtendimento
      });

      setAtendimentos(prev =>
        prev.map((item) =>
          item.id === atendimento.id
            ? ({ ...item, advogadoResponsavel: advogado, responsavel: advogado, status: 'em_andamento' } as Atendimento)
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
      carregarAtendimentos();
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

  const handleNew = () => {
    navigate('/atendimentos/novo');
  };

  const handleShowHistory = async (cpf: string) => {
    try {
      if (!cpf) {
        toast.warning('Este atendimento não possui CPF vinculado para buscar o histórico.');
        return;
      }
      const history = await atendimentoService.getAtendimentosByCpf(cpf);
      setClienteHistory(history);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      toast.error('Erro ao carregar histórico');
      setError('Erro ao carregar histórico');
    }
  };

  const handleViewDetails = (atendimento: Atendimento) => {
    setViewingAtendimento(atendimento);
    setShowDetailsModal(true);
  };

  const filteredAtendimentos = atendimentos.filter(atendimento => {
    const matchesSearch = atendimento.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atendimento.clienteCpf.includes(searchTerm);
    const matchesResponsavel = filterResponsavel === 'Todos' || atendimento.responsavel === filterResponsavel;
    const matchesCidade = filterCidade === 'Todas' || atendimento.cidade === filterCidade;
    const matchesMes = !filterMes || filterMes === 'todos' || atendimento.dataAtendimento.getMonth() === parseInt(filterMes) - 1;

    return matchesSearch && matchesResponsavel && matchesCidade && matchesMes;
  });

  return {
    // Data
    atendimentos: filteredAtendimentos,
    clienteHistory,
    responsaveis,
    cidades,
    advogados,
    meses,
    
    // UI State
    loading,
    loadingMore,
    hasMore,
    showHistoryModal,
    setShowHistoryModal,
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
  };
};
