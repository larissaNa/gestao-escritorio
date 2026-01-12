import { useState } from 'react';
import { useServico } from '@/hooks/useServico';
import { ServicoItem } from '@/types';

export function useServicosPage() {
  const {
    servicos,
    loading,
    error,
    filtros,
    criarServico,
    atualizarServico,
    excluirServico,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros
  } = useServico();

  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<ServicoItem | null>(null);
  const [formData, setFormData] = useState({
    area: '',
    tipoAcao: '',
    honorarios: '',
    observacoes: '',
    advogadoResponsavel: '',
    linkProcuração: '',
    linkChecklist: '',
    ativo: true
  });

  const areas = [
    'Cível', 'Família', 'Sucessão', 'Criminal', 'Tributário', 'Previdenciário', 'Trabalhista', 'Outros'
  ];

  const advogados = [
    'Dr. Phortus Leonardo',
    'Dr. Thiago Oliveira',
    'Dra. Janaina Oliveira',
    'Dr. Thalisson Reinaldo',
    'Dra. Lara Andrade',
    'Equipe'
  ];

  const { areas: opcoesAreas, advogados: opcoesAdvogados } = obterOpcoesFiltros();

  const resetForm = () => {
    setFormData({
      area: '',
      tipoAcao: '',
      honorarios: '',
      observacoes: '',
      advogadoResponsavel: '',
      linkProcuração: '',
      linkChecklist: '',
      ativo: true
    });
    setEditingServico(null);
  };

  const handleOpenModal = (servico?: ServicoItem) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        area: servico.area,
        tipoAcao: servico.tipoAcao,
        honorarios: servico.honorarios,
        observacoes: servico.observacoes,
        advogadoResponsavel: servico.advogadoResponsavel,
        linkProcuração: servico.linkProcuração || '',
        linkChecklist: servico.linkChecklist || '',
        ativo: servico.ativo
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.area || !formData.tipoAcao || !formData.honorarios || !formData.advogadoResponsavel) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    let success = false;
    if (editingServico && editingServico.id) {
      success = await atualizarServico(editingServico.id, formData);
    } else {
      success = await criarServico(formData);
    }

    if (success) {
      handleCloseModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      await excluirServico(id);
    }
  };

  const handleToggleAtivo = async (servico: ServicoItem) => {
    if (servico.id) {
      await atualizarServico(servico.id, { ativo: !servico.ativo });
    }
  };

  return {
    servicos,
    loading,
    error,
    filtros,
    aplicarFiltros,
    limparFiltros,
    showModal,
    setShowModal,
    editingServico,
    formData,
    setFormData,
    areas,
    advogados,
    opcoesAreas,
    opcoesAdvogados,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleToggleAtivo
  };
}
