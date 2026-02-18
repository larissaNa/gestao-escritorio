import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formularioService } from '@/model/services/formularioService';
import { FormularioColaborador } from '@/model/entities';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useFormularioViewModel = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormularioColaborador>({
    primeiroNome: '',
    sobreNome: '',
    dataNascimento: '',
    cpf: '',
    rg: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: '',
    telefonePessoal: '',
    emailPessoal: '',
    nomeContatoEmergencia: '',
    relacaoContatoEmergencia: '',
    telefoneEmergencia: '',
    tipoSanguineo: '',
    alergias: 'Não',
    quaisAlergias: '',
    doencaCronica: 'Não',
    quaisDoencas: '',
    temFilhos: 'Não',
    nomeIdadeFilhos: '',
    estadoCivil: '',
    numeroOAB: '',
    funcaoCargo: '',
    departamento: '',
    dataIngresso: '',
    hobbies: '',
    restricaoAlimentar: 'Não',
    qualRestricao: '',
    observacoesAdicionais: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Carregar dados existentes
  const carregarDados = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dados = await formularioService.carregarFormulario(user.uid);
      if (dados) {
        setFormData(dados);
      }
    } catch (error) {
      setError('Erro ao carregar dados existentes');
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validar formulário
  const validarFormulario = (): boolean => {
    console.log('Iniciando validação do formulário...');
    const errors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.primeiroNome.trim()) errors.primeiroNome = 'Primeiro nome é obrigatório';
    if (!formData.sobreNome.trim()) errors.sobreNome = 'Sobrenome é obrigatório';
    if (!formData.dataNascimento) errors.dataNascimento = 'Data de nascimento é obrigatória';
    if (!formData.cpf.trim()) errors.cpf = 'CPF é obrigatório';
    if (!formData.rg.trim()) errors.rg = 'RG é obrigatório';
    if (!formData.rua.trim()) errors.rua = 'Rua é obrigatória';
    if (!formData.numero.trim()) errors.numero = 'Número é obrigatório';
    if (!formData.bairro.trim()) errors.bairro = 'Bairro é obrigatório';
    if (!formData.cidade.trim()) errors.cidade = 'Cidade é obrigatória';
    if (!formData.cep.trim()) errors.cep = 'CEP é obrigatório';
    if (!formData.telefonePessoal.trim()) errors.telefonePessoal = 'Telefone pessoal é obrigatório';
    if (!formData.emailPessoal.trim()) errors.emailPessoal = 'E-mail pessoal é obrigatório';
    if (!formData.nomeContatoEmergencia.trim()) errors.nomeContatoEmergencia = 'Nome do contato de emergência é obrigatório';
    if (!formData.relacaoContatoEmergencia.trim()) errors.relacaoContatoEmergencia = 'Relação com o colaborador é obrigatória';
    if (!formData.telefoneEmergencia.trim()) errors.telefoneEmergencia = 'Telefone de emergência é obrigatório';
    if (!formData.tipoSanguineo.trim()) errors.tipoSanguineo = 'Tipo sanguíneo é obrigatório';
    if (!formData.estadoCivil) errors.estadoCivil = 'Estado civil é obrigatório';
    if (!formData.funcaoCargo.trim()) errors.funcaoCargo = 'Função/cargo é obrigatório';
    if (!formData.departamento.trim()) errors.departamento = 'Departamento/setor é obrigatório';
    if (!formData.dataIngresso) errors.dataIngresso = 'Data de ingresso é obrigatória';

    console.log('Erros de campos obrigatórios:', errors);

    // Validações específicas
    if (formData.cpf && !formularioService.validarCPF(formData.cpf)) {
      console.log('CPF falhou na validação');
      errors.cpf = 'CPF inválido';
    }

    if (formData.emailPessoal && !formularioService.validarEmail(formData.emailPessoal)) {
      console.log('Email falhou na validação');
      errors.emailPessoal = 'E-mail inválido';
    }

    if (formData.telefonePessoal && !formularioService.validarTelefone(formData.telefonePessoal)) {
      console.log('Telefone pessoal falhou na validação');
      errors.telefonePessoal = 'Telefone inválido';
    }

    if (formData.telefoneEmergencia && !formularioService.validarTelefone(formData.telefoneEmergencia)) {
      console.log('Telefone emergência falhou na validação');
      errors.telefoneEmergencia = 'Telefone de emergência inválido';
    }

    if (formData.cep && !formularioService.validarCEP(formData.cep)) {
      console.log('CEP falhou na validação');
      errors.cep = 'CEP inválido';
    }

    // Validações condicionais
    if (formData.alergias === 'Sim' && !formData.quaisAlergias?.trim()) {
      errors.quaisAlergias = 'Especifique as alergias';
    }

    if (formData.doencaCronica === 'Sim' && !formData.quaisDoencas?.trim()) {
      errors.quaisDoencas = 'Especifique as doenças';
    }

    if (formData.temFilhos === 'Sim' && !formData.nomeIdadeFilhos?.trim()) {
      errors.nomeIdadeFilhos = 'Especifique nome e idade dos filhos';
    }

    if (formData.restricaoAlimentar === 'Sim' && !formData.qualRestricao?.trim()) {
      errors.qualRestricao = 'Especifique a restrição alimentar';
    }

    console.log('Todos os erros encontrados:', errors);
    console.log('Formulário válido:', Object.keys(errors).length === 0);

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Salvar formulário
  const salvarFormulario = async () => {
    if (!user) return;

    if (!validarFormulario()) {
      toast.warning('Por favor, corrija os erros no formulário');
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await formularioService.salvarFormulario(user.uid, formData);
      setSuccess(true);
      toast.success('Formulário salvo com sucesso!');
      await refreshUser();
      navigate('/');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao salvar formulário';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao salvar formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo do formulário
  const atualizarCampo = (campo: keyof FormularioColaborador, valor: string) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpar erro do campo quando o usuário começa a digitar
    if (validationErrors[campo]) {
      setValidationErrors(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
  };

  // Efeitos
  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  return {
    formData,
    loading,
    error,
    success,
    validationErrors,
    atualizarCampo,
    salvarFormulario,
    carregarDados
  };
};
