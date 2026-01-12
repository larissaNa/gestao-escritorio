import { useState, useEffect } from 'react';
import { useBeneficio } from '@/hooks/useBeneficio';
import { BeneficioItem } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

export function useBeneficiosPage() {
  const {
    beneficios,
    loading,
    filtros,
    criarBeneficio,
    atualizarBeneficio,
    excluirBeneficio,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    carregarMais,
    hasMore,
    loadingMore
  } = useBeneficio();

  const [showModal, setShowModal] = useState(false);
  const [editingBeneficio, setEditingBeneficio] = useState<BeneficioItem | null>(null);
  const [responsaveis, setResponsaveis] = useState<Array<{ id: string; nome: string }>>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '' as BeneficioItem['tipo'],
    subtipo: '',
    responsavelUID: '',
    responsavelNome: '',
    cliente: '',
    data: ''
  });

  const { tipos: opcoesTipos } = obterOpcoesFiltros();

  // Carregar responsáveis
  useEffect(() => {
    const carregarResponsaveis = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'colaboradores'));
        const responsaveisData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().primeiroNome || 'Desconhecido'
        }));
        setResponsaveis(responsaveisData);
      } catch (err) {
        console.error('Erro ao carregar responsáveis:', err);
      }
    };

    carregarResponsaveis();
  }, []);

  const handleOpenModal = (beneficio?: BeneficioItem) => {
    if (beneficio) {
      setEditingBeneficio(beneficio);
      setFormData({
        nome: beneficio.nome,
        tipo: beneficio.tipo,
        subtipo: beneficio.subtipo || '',
        responsavelUID: beneficio.responsavelUID,
        responsavelNome: beneficio.responsavelNome,
        cliente: beneficio.cliente,
        data: beneficio.data.toISOString().split('T')[0]
      });
    } else {
      setEditingBeneficio(null);
      setFormData({
        nome: '',
        tipo: '' as BeneficioItem['tipo'],
        subtipo: '',
        responsavelUID: '',
        responsavelNome: '',
        cliente: '',
        data: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBeneficio(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tipo || !formData.responsavelUID || !formData.cliente || !formData.data) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const responsavelSelecionado = responsaveis.find(r => r.id === formData.responsavelUID);
    const dados = {
      ...formData,
      responsavelNome: formData.responsavelNome || responsavelSelecionado?.nome || 'Desconhecido',
      data: new Date(formData.data + 'T12:00:00')
    };

    let success = false;
    if (editingBeneficio) {
      success = await atualizarBeneficio(editingBeneficio.id!, dados);
    } else {
      success = await criarBeneficio(dados);
    }

    if (success) {
      handleCloseModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este benefício?')) {
      await excluirBeneficio(id);
    }
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  return {
    beneficios,
    loading,
    filtros,
    aplicarFiltros,
    limparFiltros,
    carregarMais,
    hasMore,
    loadingMore,
    showModal,
    setShowModal,
    editingBeneficio,
    responsaveis,
    formData,
    setFormData,
    opcoesTipos,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    formatarData
  };
}
