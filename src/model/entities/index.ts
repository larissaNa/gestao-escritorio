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
  | 'idas_banco'
  | 'caminho_cliente';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'recepcao';
  permissions?: UserPermission[];
}

export type ConfigListKey = 'tipo_acao' | 'setor' | 'demanda' | 'area' | 'categoria' | 'subcategoria' | 'escritorios';

export interface ConfigListItem {
  id: string;
  label: string;
  value: string;
  active: boolean;
  order: number;
  pontos?: number;
  cidade?: string;
  estado?: string;
  parentId?: string; // Para subcategorias vinculadas a categorias
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
  trafego?: boolean | null;
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
  | 'via_administrativa'
  | 'concluso_julgamento'
  | 'procedente'
  | 'improcedente'
  | 'parcialmente_procedente'
  | 'acordo_trabalhista'
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
  trafego?: boolean | null;
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
  advogadoResponsavel?: 'Dr. Thalisson' | 'Dra. Daiane Clara' | 'Dra. Janaína' | 'Dr. Thiago' | 'Jean Paulo';
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

// ============================================================
// Caminho do Cliente (workflow / esteira de produção do escritório)
// ============================================================

export type EtapaCaminho =
  | 'cliente_cadastrado'
  | 'contrato_assinado'
  | 'documentos_solicitados'
  | 'documentos_recebidos'
  | 'conferencia_documental'
  | 'documentacao_pendente'
  | 'processo_apto_protocolo'
  | 'protocolo_inss'
  | 'aguardando_analise_inss'
  | 'exigencia_inss'
  | 'exigencia_cumprida'
  | 'aguardando_decisao'
  | 'beneficio_concedido'
  | 'beneficio_negado'
  | 'analise_recurso_administrativo'
  | 'recurso_protocolado'
  | 'decisao_recurso'
  | 'processo_judicial_autorizado'
  | 'acao_judicial_protocolada'
  | 'citacao_contestacao'
  | 'pericia_agendada'
  | 'pericia_realizada'
  | 'sentenca'
  | 'recurso_judicial'
  | 'transito_julgado'
  | 'cumprimento_decisao'
  | 'rpv_precatorio'
  | 'valor_recebido'
  | 'honorarios_recebidos'
  | 'processo_encerrado';

export type SituacaoCaminho =
  | 'em_andamento'
  | 'aguardando_cliente'
  | 'aguardando_inss'
  | 'aguardando_justica'
  | 'pendente_interno'
  | 'concluido';

export type SetorResponsavel =
  | 'Comercial'
  | 'Recepção'
  | 'Triagem Jurídica'
  | 'Jurídico'
  | 'INSS'
  | 'Controladoria'
  | 'Advogado'
  | 'Financeiro'
  | 'Arquivo';

export interface HistoricoEtapa {
  etapa: EtapaCaminho;
  data: Date;
  responsavel: string;         // nome do colaborador que registrou
  responsavelUid?: string;
  observacao?: string;
}

export interface CaminhoCliente {
  id?: string;
  clienteId?: string;          // referência opcional à coleção `clientes`
  clienteNome: string;
  clienteCpf: string;
  tipoBeneficio?: string;
  numeroProcessoAdm?: string;
  numeroProcessoJud?: string;
  etapaAtual: EtapaCaminho;
  situacao: SituacaoCaminho;
  setorResponsavel: SetorResponsavel;
  responsavelAtual?: string;   // nome do colaborador atual
  proximaAcao?: string;
  prazoProximaAcao?: Date | null;
  observacoes?: string;
  historico: HistoricoEtapa[];
  dataUltimaMovimentacao: Date;
  dataCadastro: Date;
  ativo: boolean;
}

// Metadados de cada etapa (ordem, rótulo, setor sugerido e próxima ação padrão)
export interface EtapaMeta {
  key: EtapaCaminho;
  ordem: number;
  label: string;
  setorSugerido: SetorResponsavel;
  proximaAcaoSugerida: string;
}

export const ETAPAS_CAMINHO: EtapaMeta[] = [
  { key: 'cliente_cadastrado',            ordem: 1,  label: 'Cliente cadastrado',              setorSugerido: 'Comercial',        proximaAcaoSugerida: 'Assinar contrato' },
  { key: 'contrato_assinado',             ordem: 2,  label: 'Contrato assinado',               setorSugerido: 'Comercial',        proximaAcaoSugerida: 'Solicitar documentos' },
  { key: 'documentos_solicitados',        ordem: 3,  label: 'Documentos solicitados',          setorSugerido: 'Recepção',         proximaAcaoSugerida: 'Aguardar entrega dos documentos' },
  { key: 'documentos_recebidos',          ordem: 4,  label: 'Documentos recebidos',            setorSugerido: 'Recepção',         proximaAcaoSugerida: 'Enviar para triagem jurídica' },
  { key: 'conferencia_documental',        ordem: 5,  label: 'Conferência documental',          setorSugerido: 'Triagem Jurídica', proximaAcaoSugerida: 'Verificar pendências' },
  { key: 'documentacao_pendente',         ordem: 6,  label: 'Documentação pendente',           setorSugerido: 'Recepção',         proximaAcaoSugerida: 'Cobrar cliente' },
  { key: 'processo_apto_protocolo',       ordem: 7,  label: 'Processo apto para protocolo',    setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Protocolar no INSS' },
  { key: 'protocolo_inss',                ordem: 8,  label: 'Protocolo realizado no INSS',     setorSugerido: 'INSS',             proximaAcaoSugerida: 'Aguardar análise' },
  { key: 'aguardando_analise_inss',       ordem: 9,  label: 'Aguardando análise do INSS',      setorSugerido: 'Controladoria',    proximaAcaoSugerida: 'Acompanhar sistema INSS' },
  { key: 'exigencia_inss',                ordem: 10, label: 'Exigência do INSS',               setorSugerido: 'Controladoria',    proximaAcaoSugerida: 'Cumprir exigência' },
  { key: 'exigencia_cumprida',            ordem: 11, label: 'Exigência cumprida',              setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Aguardar decisão' },
  { key: 'aguardando_decisao',            ordem: 12, label: 'Aguardando decisão',              setorSugerido: 'Controladoria',    proximaAcaoSugerida: 'Acompanhar decisão' },
  { key: 'beneficio_concedido',           ordem: 13, label: 'Benefício concedido',             setorSugerido: 'Controladoria',    proximaAcaoSugerida: 'Repassar para financeiro' },
  { key: 'beneficio_negado',              ordem: 14, label: 'Benefício negado',                setorSugerido: 'Controladoria',    proximaAcaoSugerida: 'Fazer análise jurídica' },
  { key: 'analise_recurso_administrativo',ordem: 15, label: 'Análise para recurso administrativo', setorSugerido: 'Advogado',    proximaAcaoSugerida: 'Decidir sobre recurso' },
  { key: 'recurso_protocolado',           ordem: 16, label: 'Recurso protocolado',             setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Aguardar decisão do recurso' },
  { key: 'decisao_recurso',               ordem: 17, label: 'Decisão do recurso',              setorSugerido: 'Controladoria',    proximaAcaoSugerida: 'Analisar próxima etapa' },
  { key: 'processo_judicial_autorizado',  ordem: 18, label: 'Processo judicial autorizado',    setorSugerido: 'Advogado',         proximaAcaoSugerida: 'Ajuizar ação' },
  { key: 'acao_judicial_protocolada',     ordem: 19, label: 'Ação judicial protocolada',       setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Aguardar citação' },
  { key: 'citacao_contestacao',           ordem: 20, label: 'Citação / Contestação',           setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Aguardar perícia' },
  { key: 'pericia_agendada',              ordem: 21, label: 'Perícia agendada',                setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Preparar cliente para perícia' },
  { key: 'pericia_realizada',             ordem: 22, label: 'Perícia realizada',               setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Aguardar sentença' },
  { key: 'sentenca',                      ordem: 23, label: 'Sentença',                        setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Analisar recurso judicial' },
  { key: 'recurso_judicial',              ordem: 24, label: 'Recurso judicial',                setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Aguardar julgamento' },
  { key: 'transito_julgado',              ordem: 25, label: 'Trânsito em julgado',             setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Iniciar cumprimento' },
  { key: 'cumprimento_decisao',           ordem: 26, label: 'Cumprimento da decisão',          setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Aguardar RPV/Precatório' },
  { key: 'rpv_precatorio',                ordem: 27, label: 'RPV / Precatório em andamento',   setorSugerido: 'Jurídico',         proximaAcaoSugerida: 'Aguardar pagamento' },
  { key: 'valor_recebido',                ordem: 28, label: 'Valor recebido',                  setorSugerido: 'Financeiro',       proximaAcaoSugerida: 'Repassar honorários' },
  { key: 'honorarios_recebidos',          ordem: 29, label: 'Honorários recebidos',            setorSugerido: 'Financeiro',       proximaAcaoSugerida: 'Encerrar processo' },
  { key: 'processo_encerrado',            ordem: 30, label: 'Processo encerrado',              setorSugerido: 'Arquivo',          proximaAcaoSugerida: '—' },
];

export const SITUACOES_CAMINHO: Array<{
  key: SituacaoCaminho;
  label: string;
  color: string;   // classe Tailwind para texto/fundo
  emoji: string;
}> = [
  { key: 'em_andamento',       label: 'Em andamento',       color: 'bg-green-100 text-green-700 border-green-200',   emoji: '🟢' },
  { key: 'aguardando_cliente', label: 'Aguardando cliente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', emoji: '🟡' },
  { key: 'aguardando_inss',    label: 'Aguardando INSS',    color: 'bg-orange-100 text-orange-700 border-orange-200', emoji: '🟠' },
  { key: 'aguardando_justica', label: 'Aguardando Justiça', color: 'bg-blue-100 text-blue-700 border-blue-200',       emoji: '🔵' },
  { key: 'pendente_interno',   label: 'Pendente interno',   color: 'bg-red-100 text-red-700 border-red-200',           emoji: '🔴' },
  { key: 'concluido',          label: 'Concluído',          color: 'bg-emerald-100 text-emerald-700 border-emerald-200', emoji: '✅' },
];
