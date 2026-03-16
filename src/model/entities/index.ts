// Tipos de usuário
export type UserPermission =
  | 'dashboard'
  | 'atendimentos'
  | 'relatorios'
  | 'servicos'
  | 'cadastro'
  | 'acoes_advogados'
  | 'processos_advogados'
  | 'financeiro'
  | 'idas_banco';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'recepcao';
  permissions?: UserPermission[];
}

export type ConfigListKey = 'tipo_acao' | 'setor' | 'demanda' | 'area' | 'categoria' | 'escritorios';

export interface ConfigListItem {
  id: string;
  label: string;
  value: string;
  active: boolean;
  order: number;
  pontos?: number;
  cidade?: string;
  estado?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos de atendimento
export type AtendimentoStatus =
  | 'em_andamento'
  | 'aguardando_documentacao'
  | 'repassado'
  | 'fechado_com_contrato'
  | 'encerrado_sem_contrato'
  | 'finalizado';

export type AtendimentoFechamentoChecklistKey = 'pasta_drive' | 'procuracao_especifica' | 'contrato';

export interface AtendimentoAnexo {
  id: string;
  nome: string;
  url: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface AtendimentoFechamento {
  tipoProcesso: string;
  checklist: Record<AtendimentoFechamentoChecklistKey, boolean>;
  contratoLink: string;
  driveLink: string;
  documentacaoCompleta: boolean;
  anexos: AtendimentoAnexo[];
  concluidoEm?: Date;
}

export interface Atendimento {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteCpf: string;
  clienteTelefone: string;
  tipoProcedimento: string;
  tipoAcao: string;
  responsavel: string;
  cidade: string;
  dataAtendimento: Date;
  observacoes?: string;
  advogadoResponsavel?: string;
  modalidade?: 'Online' | 'Presencial';
  status: AtendimentoStatus;
  fechamento?: Partial<AtendimentoFechamento>;
}


// Tipos de notificação
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Tipos de pré-cadastro
export interface PreCadastro {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  dataCadastro: Date;
  status: 'aguardando' | 'em_atendimento' | 'finalizado';
  responsavel?: string;
}

// Tipos de relatório
export interface RelatorioItem {
  id?: string;
  demanda: string;  // novo campo
  pontos?: number;  // exibido só para admin
  protocolo?: string;
  cliente: string;
  tipo_acao: string;
  setor: string;
  responsavel: string;
  responsavelNome: string;
  data: Date;
  mes: number;
  status?: string;
  observacao?: string;
}

export interface IdaBanco {
  id: string;
  clienteNome: string;
  responsavelId: string;
  responsavelNome: string;
  dataIda: Date;
  banco: string;
  numeroIda: number;
  observacoes?: string;
  createdAt: Date;
}

// Tipos de benefício
export interface BeneficioItem {
  dataCriacao: Date;
  id?: string;
  nome: string;
  tipo: 'Administrativo' | 'Judicial';
  subtipo?: string;
  responsavelUID: string;
  responsavelNome: string;
  cliente: string;
  data: Date;
}

// Tipos de serviço
export interface ServicoItem {
  id?: string;
  area: string;
  tipoAcao: string;
  honorarios: string;
  observacoes: string;
  advogadoResponsavel: string;
  linkProcuração?: string;
  linkChecklist?: string;
  ativo: boolean;
}

// Tipos de ações dos advogados
export interface AcaoAdvogado {
  id?: string;
  cliente: string;
  advogado: string;
  area: string;
  situacao: 'inicial' | 'em andamento' | 'finalizado';
  dataCadastro: Date;
  observacoes?: string;
  valor?: number;
  prazo?: Date;
}

export type StatusProcessoAdvogado =
  | 'dados_entrada'
  | 'audiencia'
  | 'aguardando_retorno_cliente'
  | 'aguardando_documentacao'
  | 'atendimento'
  | 'concluso_julgamento'
  | 'procedente'
  | 'improcedente'
  | 'parcialmente_procedente'
  | 'aguardando_pagamento';

export type AreaAtuacao = 
  | 'Previdenciário'
  | 'Cível'
  | 'Criminal'
  | 'Bancário'
  | 'Família'
  | 'Consumidor'
  | 'Tributário'
  | 'Imobiliário'
  | 'Trabalhista'
  | (string & {});

export type ResultadoAlcancado = 
  | 'Procedente'
  | 'Improcedente'
  | 'Parcialmente Procedente'
  | 'Acordo';

export interface ProcessoEmAndamento {
  numeroProcesso: string;
  linkProcesso: string;
  cliente: string;
  statusProcesso: StatusProcessoAdvogado;
  dataAjuizamento?: Date;
  dataDecisao?: Date;
}

export interface ProcessoAdvogado {
  id?: string;
  uidAdvogado: string;
  nomeAdvogado: string;
  cliente: string;
  numeroProcesso: string; // Processo ou CPF
  tipoParceria: 'escritorio' | 'advogado';
  areaAtuacao: AreaAtuacao;
  status: StatusProcessoAdvogado;
  formaPagamento: string;
  dataEntrada?: Date | null;
  dataFinalizacao?: Date | null;
  honorariosRecebidos: number;
  honorariosRepassados: number;
  dataUltimaAtualizacao: Date;
  ativo: boolean;
}

// Tipos de Concessão/Procedente
export interface Concessao {
  id?: string;
  nome: string;
  tipo: AreaAtuacao;
  data: Date;
  responsavelUID: string;
  responsavelNome: string;
  cliente: string;
}

// Tipos de benefício
export interface Beneficio {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  tipo: 'percentual' | 'fixo';
  ativo: boolean;
  dataCriacao: Date;
}


export interface FormularioColaborador {
  id?: string;
  primeiroNome: string;
  sobreNome: string;
  dataNascimento: string;
  cpf: string;
  rg: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  telefonePessoal: string;
  emailPessoal:   string;
  nomeContatoEmergencia: string;
  relacaoContatoEmergencia: string;
  telefoneEmergencia: string;
  tipoSanguineo: string;
  alergias: 'Sim' | 'Não';
  quaisAlergias?: string;
  doencaCronica: 'Sim' | 'Não';
  quaisDoencas?: string;
  temFilhos: 'Sim' | 'Não';
  nomeIdadeFilhos?: string;
  estadoCivil: string;
  numeroOAB?: string;
  funcaoCargo: string;
  departamento: string;
  dataIngresso: string;
  hobbies?: string;
  restricaoAlimentar: 'Sim' | 'Não';
  qualRestricao?: string;
  observacoesAdicionais?: string;
}

// Tipos de cliente
export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco?: string;
  dataCadastro: Date;
  cidade: string
  advogadoResponsavel?: 'Dr. Thalisson' | 'Dra. Lara' | 'Dra. Janaína' | 'Dr. Thiago' | 'Jean Paulo';
  status: 'ativo' | 'inativo';
}

// Tipos de serviço
export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  categoria: string;
  ativo: boolean;
  dataCriacao: Date;
}

// Tipos de relatório
export interface Relatorio {
  id: string;
  titulo: string;
  tipo: 'atendimentos' | 'pontos' | 'beneficios' | 'servicos';
  periodo: {
    inicio: Date;
    fim: Date;
  };
  dados: unknown;
  dataGeracao: Date;
  geradoPor: string;
}

// Tipos Financeiros
export interface Receita {
  id: string;
  escritorio?: string;
  descricao: string;
  valorTotal: number;
  valorPago: number;
  valorAberto: number;
  dataVencimento: Date;
  status: 'pago' | 'pendente' | 'atrasado';
  categoria: string;
  subcategoria?: string;
  origem: string; // ex: "Honorários - Processo 123"
}

export interface CustoServico {
  id: string;
  escritorio?: string;
  descricao: string;
  valor: number;
  categoria: string;
  subcategoria?: string;
  data: Date;
  pago: boolean;
  origem: string;
  recorrente: boolean;
}

export interface ResumoFinanceiro {
  receitaTotal: number;
  receitaRecebida: number;
  receitaPendente: number;
  custosTotais: number;
  resultadoLiquido: number; // Recebida - Custos
}

// Tipos para gráficos
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// Tipos de contexto
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasFilledForm: boolean;
  colaboradorName: string;
  isAdmin: boolean;
  canAccessPath: (pathname: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Tipos de formulário
export interface FormData {
  [key: string]: unknown;
}

// Tipos de validação
export interface ValidationError {
  field: string;
  message: string;
}
