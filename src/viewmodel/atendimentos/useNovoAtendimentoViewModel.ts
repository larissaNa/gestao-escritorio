import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { atendimentoService } from '@/model/services/atendimentoService';
import { clienteService } from '@/model/services/clienteService';
import type { Atendimento, AtendimentoFechamentoChecklistKey, AtendimentoStatus, Cliente } from '@/model/entities';
import { toast } from 'sonner';
import { useConfigListOptions } from '@/viewmodel/configLists/useConfigListOptions';
import { useAuth } from '@/contexts/AuthContext';

export const useNovoAtendimento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, colaboradorName } = useAuth();

  // Data State
  const [cpfSuggestions, setCpfSuggestions] = useState<Cliente[]>([]);
  const [nomeSuggestions, setNomeSuggestions] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);

  // Loading & Error State
  const [loading, setLoading] = useState(false);
  const [searchingClient, setSearchingClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [showCpfSuggestions, setShowCpfSuggestions] = useState(false);
  const [showNomeSuggestions, setShowNomeSuggestions] = useState(false);

  // Form State
  const initialChecklist: Record<AtendimentoFechamentoChecklistKey, boolean> = {
    pasta_drive: false,
    procuracao_especifica: false,
    contrato: false,
  };

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
    dataAtendimento: new Date().toISOString().split('T')[0], // Default to today
    modalidade: 'Presencial',
    status: 'em_andamento' as AtendimentoStatus,
    fechamento: {
      tipoProcesso: '',
      checklist: { ...initialChecklist },
      contratoLink: '',
      driveLink: '',
      documentacaoCompleta: false,
      concluidoEm: undefined as Date | undefined,
    }
  };
  const [formData, setFormData] = useState(initialFormState);

  const { options: tiposAcaoOptions } = useConfigListOptions('tipo_acao', { activeOnly: true });

  const tiposAcao = tiposAcaoOptions.map((o) => o.value);

  const responsavelAuto = colaboradorName || user?.displayName || user?.email || 'Desconhecido';

  const cidades = ['Piripiri', 'Pedro II'];

  const advogados = [
    'Dra. Lara Andrade', 'Dr. Thiago Oliveria',
    'Dra. Janaína Oliveira', 'Dr. Jean Paulo ', 'Dr. Thalisson Reinaldo'
  ];

  useEffect(() => {
    if (id) return;
    if (!responsavelAuto) return;
    setFormData((prev) => (prev.responsavel ? prev : { ...prev, responsavel: responsavelAuto }));
  }, [id, responsavelAuto]);

  // Load existing atendimento if editing
  useEffect(() => {
    const loadAtendimento = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const atendimento = await atendimentoService.getAtendimentoById(id);
        if (atendimento) {
          setEditingAtendimento(atendimento);
          
          // Format date as YYYY-MM-DD
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
            modalidade: atendimento.modalidade || 'Presencial',
            status: (atendimento.status || 'em_andamento') as AtendimentoStatus,
            fechamento: {
              tipoProcesso: atendimento.fechamento?.tipoProcesso || '',
              checklist: {
                pasta_drive: Boolean(atendimento.fechamento?.checklist?.pasta_drive),
                procuracao_especifica: Boolean(atendimento.fechamento?.checklist?.procuracao_especifica),
                contrato: Boolean(atendimento.fechamento?.checklist?.contrato),
              },
              contratoLink: atendimento.fechamento?.contratoLink || '',
              driveLink: atendimento.fechamento?.driveLink || '',
              documentacaoCompleta: Boolean(atendimento.fechamento?.documentacaoCompleta),
              concluidoEm: atendimento.fechamento?.concluidoEm,
            }
          });
        } else {
          setError('Atendimento não encontrado');
          navigate('/atendimentos');
        }
      } catch (err) {
        console.error('Erro ao carregar atendimento:', err);
        setError('Erro ao carregar atendimento');
      } finally {
        setLoading(false);
      }
    };

    loadAtendimento();
  }, [id, navigate]);

  const validateAtendimentoObrigatorios = () => {
    if (!formData.cpf?.trim()) return 'CPF é obrigatório.';
    if (!formData.nome?.trim()) return 'Nome é obrigatório.';
    if (!formData.telefone?.trim()) return 'Telefone é obrigatório.';
    if (!formData.tipoAcao?.trim()) return 'Tipo de Ação é obrigatório.';
    if (!formData.cidade?.trim()) return 'Cidade é obrigatória.';
    if (!formData.dataAtendimento?.trim()) return 'Data do Atendimento é obrigatória.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requiredError = validateAtendimentoObrigatorios();
      if (requiredError) {
        toast.warning(requiredError);
        return;
      }

      setLoading(true);
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
        responsavel: formData.responsavel || responsavelAuto,
        cidade: formData.cidade,
        dataAtendimento: dataAtendimentoLocal,
        observacoes: formData.observacoes,
        advogadoResponsavel: formData.advogadoResponsavel,
        modalidade: formData.modalidade as 'Online' | 'Presencial',
        status: (formData.status || editingAtendimento?.status || 'em_andamento') as AtendimentoStatus,
        fechamento: formData.fechamento
      };

      if (id) {
        await atendimentoService.atualizarAtendimento(id, atendimentoData);
        toast.success('Atendimento atualizado com sucesso!');
      } else {
        await atendimentoService.criarAtendimento(atendimentoData);
        toast.success('Atendimento criado com sucesso!');
      }

      navigate('/atendimentos');
    } catch (err) {
      console.error('Erro ao salvar atendimento:', err);
      toast.error('Erro ao salvar atendimento');
      setError('Erro ao salvar atendimento');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarFechamento = async () => {
    if (!id) {
      toast.warning('Salve o atendimento antes de registrar o fechamento.');
      return;
    }

    try {
      setLoading(true);
      await atendimentoService.atualizarAtendimento(id, {
        fechamento: formData.fechamento,
        status: formData.status,
      });
      toast.success('Fechamento salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar fechamento:', err);
      toast.error('Erro ao salvar fechamento');
    } finally {
      setLoading(false);
    }
  };

  const validateConcluirFechamento = () => {
    if (!formData.fechamento.tipoProcesso?.trim()) return 'Selecione o tipo de processo.';

    const checklist = formData.fechamento.checklist;
    const obrigatorios: AtendimentoFechamentoChecklistKey[] = ['pasta_drive', 'procuracao_especifica', 'contrato'];
    const faltando = obrigatorios.filter((k) => !checklist[k]);
    if (faltando.length) return 'Marque todos os itens obrigatórios do checklist.';

    if (!formData.fechamento.driveLink?.trim()) return 'Informe o link da pasta no Drive.';
    if (!formData.fechamento.contratoLink?.trim()) return 'Informe o link do contrato digitalizado.';

    return null;
  };

  const handleConcluirFechamento = async () => {
    if (!id) {
      toast.warning('Salve o atendimento antes de concluir o fechamento.');
      return;
    }

    const requiredError = validateConcluirFechamento();
    if (requiredError) {
      toast.warning(requiredError);
      return;
    }

    try {
      setLoading(true);
      const fechamentoAtualizado = {
        ...formData.fechamento,
        concluidoEm: new Date(),
      };
      await atendimentoService.atualizarAtendimento(id, {
        fechamento: fechamentoAtualizado,
        status: 'fechado_com_contrato',
      });
      setFormData((prev) => ({
        ...prev,
        status: 'fechado_com_contrato',
        fechamento: fechamentoAtualizado,
      }));
      toast.success('Fechamento concluído com sucesso!');
    } catch (err) {
      console.error('Erro ao concluir fechamento:', err);
      toast.error('Erro ao concluir fechamento');
    } finally {
      setLoading(false);
    }
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

      // Try to find last attendance to autocomplete
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

  const handleCancel = () => {
    navigate('/atendimentos');
  };

  return {
    // Data
    cpfSuggestions,
    nomeSuggestions,
    tiposAcao,
    cidades,
    advogados,
    responsavelAuto,
    
    // UI State
    loading,
    searchingClient,
    error,
    showCpfSuggestions,
    setShowCpfSuggestions,
    showNomeSuggestions,
    setShowNomeSuggestions,
    isEditing: !!id,

    // Form State
    formData,
    setFormData,

    // Handlers
    handleSubmit,
    handleSalvarFechamento,
    handleConcluirFechamento,
    handleNomeChange,
    handleCpfChange,
    selectSuggestion,
    handleCancel
  };
};
