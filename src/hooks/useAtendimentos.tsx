import { useState, useEffect, useCallback } from 'react';
import { atendimentoService } from '@/services/atendimentoService';
import { clienteService } from '@/services/clienteService';
import { Atendimento, Cliente } from '@/types';

export const useAtendimentos = () => {
  // Data State
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [clienteHistory, setClienteHistory] = useState<Atendimento[]>([]);
  const [cpfSuggestions, setCpfSuggestions] = useState<Cliente[]>([]);
  const [nomeSuggestions, setNomeSuggestions] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);

  // Loading & Error State
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchingClient, setSearchingClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingAtendimento, setViewingAtendimento] = useState<Atendimento | null>(null);
  const [showCpfSuggestions, setShowCpfSuggestions] = useState(false);
  const [showNomeSuggestions, setShowNomeSuggestions] = useState(false);
  const [advogadoSelecionado, setAdvogadoSelecionado] = useState<Record<string, string>>({});

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponsavel, setFilterResponsavel] = useState('Todos');
  const [filterCidade, setFilterCidade] = useState('Todas');
  const [filterMes, setFilterMes] = useState('');

  // Form State
  const initialFormState = {
    nome: '',
    cpf: '',
    telefone: '',
    tipoProcedimento: '',
    tipoAcao: '',
    responsavel: '',
    cidade: '',
    observacoes: '',
    advogadoResponsavel: '',
    dataAtendimento: '',
    modalidade: 'Presencial'
  };
  const [formData, setFormData] = useState(initialFormState);

  // Constants
  const tiposAcao = [
    'Aposentadoria urbana', 'Aposentadoria rural', 'Benefício por incapacidade', 'Salário maternidade',
    'Pensão por morte', 'BPC Deficiente', 'BPC Idoso', 'Ação civil', 'Ação trabalhista', 'Ações administrativas',
    'Ações bancárias', 'Ações de família', 'Ações de imobiliário', 'Ações tributárias', 'Ações criminais', 'Outras ações'
  ];

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
        const novosItens = [...prev, ...itens];
        // Re-run uniqueness check on the combined list to ensure correctness across pages
        // Although this might be expensive if list is huge, it ensures consistency
        // A optimized version would only check against existing items map
        // For now, reusing the logic from component
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
    } finally {
      setLoadingMore(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedCliente(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create date ensuring it's in local timezone (00:00:00)
      const [year, month, day] = formData.dataAtendimento.split('-').map(Number);
      const dataAtendimentoLocal = new Date(year, month - 1, day);

      const atendimentoData = {
        clienteId: selectedCliente?.id || '',
        clienteNome: formData.nome,
        clienteCpf: formData.cpf,
        clienteTelefone: formData.telefone,
        tipoProcedimento: formData.tipoProcedimento,
        tipoAcao: formData.tipoAcao,
        responsavel: formData.responsavel,
        cidade: formData.cidade,
        dataAtendimento: dataAtendimentoLocal,
        observacoes: formData.observacoes,
        advogadoResponsavel: formData.advogadoResponsavel,
        modalidade: formData.modalidade as 'Online' | 'Presencial',
        status: 'em_andamento' as const
      };

      if (editingAtendimento) {
        await atendimentoService.updateAtendimento(editingAtendimento.id, atendimentoData);
      } else {
        await atendimentoService.createAtendimento(atendimentoData);
      }

      setShowModal(false);
      setEditingAtendimento(null);
      resetForm();
      carregarAtendimentos();
    } catch (err) {
      console.error('Erro ao salvar atendimento:', err);
      setError('Erro ao salvar atendimento');
    }
  };

  const handleRepassar = async (atendimento: Atendimento) => {
    const advogado = advogadoSelecionado[atendimento.id] || '';
    if (!advogado) {
      alert('Selecione um advogado para repassar.');
      return;
    }

    try {
      await atendimentoService.updateAtendimento(atendimento.id, {
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
      alert('Atendimento repassado com sucesso!');
    } catch (err) {
      console.error('Erro ao repassar atendimento:', err);
      setError('Erro ao repassar atendimento');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este atendimento?')) {
      try {
        await atendimentoService.deleteAtendimento(id);
        carregarAtendimentos();
      } catch (err) {
        console.error('Erro ao deletar atendimento:', err);
        setError('Erro ao deletar atendimento');
      }
    }
  };

  const handleEdit = (atendimento: Atendimento) => {
    setEditingAtendimento(atendimento);
    
    // Format date as YYYY-MM-DD using local time
    const date = atendimento.dataAtendimento;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setFormData({
      nome: atendimento.clienteNome,
      cpf: atendimento.clienteCpf,
      telefone: atendimento.clienteTelefone,
      tipoProcedimento: atendimento.tipoProcedimento,
      tipoAcao: atendimento.tipoAcao,
      responsavel: atendimento.responsavel,
      cidade: atendimento.cidade,
      observacoes: atendimento.observacoes || '',
      advogadoResponsavel: atendimento.advogadoResponsavel || '',
      dataAtendimento: formattedDate,
      modalidade: atendimento.modalidade || 'Presencial'
    });
    setShowModal(true);
  };

  const handleClienteSearch = async (termo: string) => {
    const cpfLimpo = termo.replace(/\D/g, '');
    const isCpf = cpfLimpo.length === 11;
    
    if (!isCpf && termo.length < 3) return;

    try {
      setSearchingClient(true);
      
      if (isCpf) {
        let cliente = await clienteService.getClienteByCpf(termo);
        if (!cliente && termo !== cpfLimpo) {
          cliente = await clienteService.getClienteByCpf(cpfLimpo);
        }

        if (cliente) {
          setSelectedCliente(cliente);
          setFormData(prev => ({
            ...prev,
            nome: cliente.nome,
            cpf: cliente.cpf,
            telefone: cliente.telefone
          }));
          setSearchingClient(false);
          return;
        }
      } 
      
      if (!isCpf) {
        const clientes = await clienteService.getClienteByNome(termo);
        if (clientes.length > 0) {
          const cliente = clientes[0];
          setSelectedCliente(cliente);
          setFormData(prev => ({
            ...prev,
            nome: cliente.nome,
            cpf: cliente.cpf,
            telefone: cliente.telefone
          }));
          setSearchingClient(false);
          return;
        }
      }

      if (isCpf) {
        const historico = await atendimentoService.getAtendimentosByCpf(termo);
        let historicoFinal = historico;
        if (historico.length === 0 && termo !== cpfLimpo) {
           historicoFinal = await atendimentoService.getAtendimentosByCpf(cpfLimpo);
        }

        if (historicoFinal.length > 0) {
          const ultimoAtendimento = historicoFinal[0];
          setFormData(prev => ({
            ...prev,
            nome: ultimoAtendimento.clienteNome,
            telefone: ultimoAtendimento.clienteTelefone
          }));
        }
      }
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
    } finally {
      setSearchingClient(false);
    }
  };

  const handleNomeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setFormData(prev => ({ ...prev, nome }));
    
    if (nome.length >= 3) {
      try {
        const nomeCapitalizado = nome.charAt(0).toUpperCase() + nome.slice(1);
        const clientes = await clienteService.getClienteByNome(nomeCapitalizado);
        setNomeSuggestions(clientes);
        setShowNomeSuggestions(true);
      } catch (err) {
        console.error('Erro ao buscar sugestões de nome:', err);
      }
    } else {
      setNomeSuggestions([]);
      setShowNomeSuggestions(false);
    }
  };

  const handleCpfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cpf = e.target.value;
    setFormData(prev => ({ ...prev, cpf }));
    
    const cpfNumeros = cpf.replace(/\D/g, '');
    
    if (cpfNumeros.length === 11) {
      handleClienteSearch(cpf);
      setShowCpfSuggestions(false);
      return;
    }

    if (cpfNumeros.length >= 3) {
      try {
        const clientes = await clienteService.getClientesByPartialCpf(cpfNumeros);
        setCpfSuggestions(clientes);
        setShowCpfSuggestions(true);
      } catch (err) {
        console.error('Erro ao buscar sugestões de CPF:', err);
      }
    } else {
      setCpfSuggestions([]);
      setShowCpfSuggestions(false);
    }
  };

  const selectSuggestion = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setFormData(prev => ({
      ...prev,
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone: cliente.telefone
    }));
    setShowNomeSuggestions(false);
    setShowCpfSuggestions(false);
    setSearchingClient(false);
  };

  const handleShowHistory = async (cpf: string) => {
    try {
      if (!cpf) {
        alert('Este atendimento não possui CPF vinculado para buscar o histórico.');
        return;
      }
      const history = await atendimentoService.getAtendimentosByCpf(cpf);
      setClienteHistory(history);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
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
    cpfSuggestions,
    nomeSuggestions,
    tiposAcao,
    responsaveis,
    cidades,
    advogados,
    meses,
    
    // UI State
    loading,
    loadingMore,
    hasMore,
    searchingClient,
    showModal,
    setShowModal,
    showHistoryModal,
    setShowHistoryModal,
    showDetailsModal,
    setShowDetailsModal,
    viewingAtendimento,
    setViewingAtendimento,
    showCpfSuggestions,
    setShowCpfSuggestions,
    showNomeSuggestions,
    setShowNomeSuggestions,
    advogadoSelecionado,
    setAdvogadoSelecionado,
    editingAtendimento,

    // Form State
    formData,
    setFormData,

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
    handleSubmit,
    handleRepassar,
    handleDelete,
    handleEdit,
    handleNomeChange,
    handleCpfChange,
    selectSuggestion,
    handleShowHistory,
    handleViewDetails,
    resetForm,
  };
};
