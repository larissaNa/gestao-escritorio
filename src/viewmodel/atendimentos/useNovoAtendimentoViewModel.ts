import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { atendimentoService } from '@/model/services/atendimentoService';
import { clienteService } from '@/model/services/clienteService';
import { Atendimento, Cliente } from '@/model/entities';
import { toast } from 'sonner';

export const useNovoAtendimento = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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
            modalidade: atendimento.modalidade || 'Presencial'
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

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedCliente(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        responsavel: formData.responsavel,
        cidade: formData.cidade,
        dataAtendimento: dataAtendimentoLocal,
        observacoes: formData.observacoes,
        advogadoResponsavel: formData.advogadoResponsavel,
        modalidade: formData.modalidade as 'Online' | 'Presencial',
        status: editingAtendimento?.status || 'em_andamento' as const
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
    responsaveis,
    cidades,
    advogados,
    
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
    handleNomeChange,
    handleCpfChange,
    selectSuggestion,
    handleCancel
  };
};
