import { useState, useMemo } from 'react';
import { useRelatorio } from './useRelatorio';
import { useAuth } from '@/contexts/AuthContext';
import { RelatorioItem } from '@/types';

export const demandas = [
  { nome: 'Petição inicial', pontos: 5 },
  { nome: 'Recursos', pontos: 5 },
  { nome: 'Petição ADM', pontos: 4 },
  { nome: 'Impugnação, manifestação e réplicas', pontos: 4 },
  { nome: 'Atendimento', pontos: 3 },
  { nome: 'Diligências', pontos: 2 },
  { nome: 'Exigência, prorrogação, análise de protocolo', pontos: 2 },
  { nome: 'Organização de doc, digitalização, balcão, atualização de senha', pontos: 1 }
];

export const tiposAcao = [
  'Aposentadoria urbana',
  'Aposentadoria rural',
  'Benefício por incapacidade',
  'Salário maternidade',
  'Pensão por morte',
  'BPC Deficiente',
  'BPC Idoso',
  'Ação civil',
  'Ação trabalhista',
  'Ações gerenciais',
  'Ações administrativas',
  'Outras ações'
];

export const setores = ['ADM', 'Judicial', 'Diligências', 'Atendimentos', 'Outros'];

export function useRelatorioPage() {
  const { user, colaboradorName } = useAuth();
  const {
    relatorios,
    loading,
    saving,
    error,
    filtros,
    criarRelatorio,
    atualizarRelatorio,
    excluirRelatorio,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    carregarRelatorios
  } = useRelatorio();

  const [showModal, setShowModal] = useState(false);
  const [editingRelatorio, setEditingRelatorio] = useState<RelatorioItem | null>(null);
  const [formData, setFormData] = useState({
    demanda: '',
    protocolo: '',
    cliente: '',
    tipo_acao: '',
    setor: '',
    pontos: 0
  });

  const { responsaveis, tiposAcao: opcoesTipoAcao, setores: opcoesSetores, meses } = obterOpcoesFiltros();

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRelatorio(null);
    setFormData({
      demanda: '',
      protocolo: '',
      cliente: '',
      tipo_acao: '',
      setor: '',
      pontos: 0
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user) return;

    // Usar o nome do colaborador do contexto de autenticação
    const responsavelNome = colaboradorName || user.displayName ||
      (user.email ? user.email.split('@')[0] : 'Usuário não identificado');

    const relatorioData = {
      ...formData,
      demanda: formData.demanda,
      pontos: formData.pontos || 0,
      responsavel: user.uid,
      responsavelNome,
      dataRelatorio: new Date().toISOString().split('T')[0],
      status: 'ativo'
    };

    try {
      if (editingRelatorio) {
        await atualizarRelatorio(editingRelatorio.id!, relatorioData);
      } else {
        await criarRelatorio(relatorioData);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
    }
  };

  const handleEdit = (relatorio: RelatorioItem) => {
    setEditingRelatorio(relatorio);
    setFormData({
      demanda: relatorio.demanda,
      protocolo: relatorio.protocolo ?? '',
      cliente: relatorio.cliente,
      tipo_acao: relatorio.tipo_acao,
      setor: relatorio.setor,
      pontos: relatorio.pontos || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
      await excluirRelatorio(id);
    }
  };

  const handleDemandaChange = (value: string) => {
    const selected = demandas.find(d => d.nome === value);
    setFormData({
      ...formData,
      demanda: value,
      pontos: selected?.pontos || 0
    });
  };

  // Helper para controlar selects de filtro que precisam de valor "Todos"
  const getFilterValue = (val: any) => {
    if (val === "" || val === null || val === undefined) return "ALL";
    return String(val);
  };

  const handleFilterChange = (field: string, val: string) => {
    aplicarFiltros({ [field]: val === "ALL" ? "" : val });
  };

  // Resumo de pontos por responsável (somente admin visualiza)
  const resumoPontos = useMemo(() => {
    if (user?.role !== "admin") return [];

    const mapa = new Map<string, { nome: string; pontos: number }>();

    relatorios.forEach((rel) => {
      const nome = rel.responsavelNome || rel.responsavel;
      const pts = rel.pontos || 0;

      if (!mapa.has(nome)) {
        mapa.set(nome, { nome, pontos: pts });
      } else {
        mapa.get(nome)!.pontos += pts;
      }
    });

    return Array.from(mapa.values());
  }, [relatorios, user]);

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1] || '';
  };

  return {
    relatorios,
    loading,
    saving,
    error,
    filtros,
    showModal,
    setShowModal,
    editingRelatorio,
    formData,
    setFormData,
    handleSave,
    handleEdit,
    handleDelete,
    handleCloseModal,
    handleDemandaChange,
    handleFilterChange,
    limparFiltros,
    getFilterValue,
    formatarData,
    getMesNome,
    resumoPontos,
    responsaveis,
    opcoesTipoAcao,
    opcoesSetores,
    meses,
    user
  };
}
