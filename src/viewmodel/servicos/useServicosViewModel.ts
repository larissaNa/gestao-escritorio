import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { servicoService } from '@/model/services/servicoService';
import { ServicoItem } from '@/model/entities';
import { useConfigListOptions } from '@/viewmodel/configLists/useConfigListOptions';

export const useServicos = () => {
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [filtros, setFiltros] = useState({
    area: '',
    advogado: ''
  });

  const carregarServicos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await servicoService.buscarTodos();
      setServicos(dados);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar serviços';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarServicos();
  }, [carregarServicos]);

  const handleNew = () => {
    navigate('/servicos/novo');
  };

  const handleEdit = (servico: ServicoItem) => {
    if (servico.id) {
      navigate(`/servicos/editar/${servico.id}`);
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
      await servicoService.excluirServico(deleteId);
      await carregarServicos();
      toast.success('Serviço excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir serviço:', err);
      setError('Erro ao excluir serviço');
      toast.error('Erro ao excluir serviço');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleAtivo = async (servico: ServicoItem) => {
    if (servico.id) {
      try {
        await servicoService.atualizarServico(servico.id, { ativo: !servico.ativo });
        await carregarServicos();
        toast.success('Status do serviço atualizado com sucesso!');
      } catch (err) {
        console.error('Erro ao atualizar status do serviço:', err);
        setError('Erro ao atualizar status do serviço');
        toast.error('Erro ao atualizar status do serviço');
      }
    }
  };

  const aplicarFiltros = (novosFiltros: Partial<typeof filtros>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const limparFiltros = () => {
    setFiltros({
      area: '',
      advogado: ''
    });
  };

  const servicosFiltrados = useMemo(() => {
    return servicos.filter(servico => {
      if (filtros.area && servico.area !== filtros.area) return false;
      if (filtros.advogado && servico.advogadoResponsavel !== filtros.advogado) return false;
      return true;
    });
  }, [servicos, filtros]);

  const { options: areasOptions } = useConfigListOptions('area', { activeOnly: true });

  const obterOpcoesFiltros = useMemo(() => {
    const areas = areasOptions.map((o) => o.value);
    const advogados = [...new Set(servicos.map(s => s.advogadoResponsavel))].sort();

    return {
      areas,
      advogados
    };
  }, [servicos, areasOptions]);

  return {
    servicos: servicosFiltrados,
    loading,
    error,
    filtros,
    handleNew,
    handleEdit,
    confirmDelete,
    cancelDelete,
    executeDelete,
    handleToggleAtivo,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    deleteId
  };
};
