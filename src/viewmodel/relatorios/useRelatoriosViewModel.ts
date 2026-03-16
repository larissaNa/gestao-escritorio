import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { relatorioService } from '@/model/services/relatorioService';
import { colaboradorService } from '@/model/services/colaboradorService';
import { RelatorioItem } from '@/model/entities';
import { useConfigListOptions } from '@/viewmodel/configLists/useConfigListOptions';

export const useRelatorios = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [relatorios, setRelatorios] = useState<RelatorioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [filtros, setFiltros] = useState({
    responsavel: '',
    tipoAcao: '',
    setor: '',
    mes: ''
  });

  const { options: tiposAcaoOptions } = useConfigListOptions('tipo_acao', { activeOnly: true });
  const { options: setoresOptions } = useConfigListOptions('setor', { activeOnly: true });

  const carregarRelatorios = useCallback(async () => {
    try {
      setLoading(true);
      const dados = await relatorioService.buscarTodos();

      // Buscar nomes dos responsáveis
      const relatoriosComNomes = await Promise.all(
        dados.map(async (relatorio) => {
          try {
            const nomeResponsavel = await colaboradorService.getNomeCompleto(relatorio.responsavel);
            return {
              ...relatorio,
              responsavelNome: nomeResponsavel || relatorio.responsavelNome || 'Usuário não identificado'
            };
          } catch {
            return {
              ...relatorio,
              responsavelNome: relatorio.responsavelNome || 'Usuário não identificado'
            };
          }
        })
      );

      setRelatorios(relatoriosComNomes);
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
      setError('Erro ao carregar relatórios');
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      carregarRelatorios();
    }
  }, [user, carregarRelatorios]);

  const handleNew = () => {
    navigate('/relatorio/novo');
  };

  const handleEdit = (relatorio: RelatorioItem) => {
    navigate(`/relatorio/editar/${relatorio.id}`);
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
      await relatorioService.excluirRelatorio(deleteId);
      await carregarRelatorios();
      toast.success('Relatório excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir relatório:', err);
      setError('Erro ao excluir relatório');
      toast.error('Erro ao excluir relatório');
    } finally {
      setDeleteId(null);
    }
  };

  const aplicarFiltros = (novosFiltros: Partial<typeof filtros>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const limparFiltros = () => {
    setFiltros({
      responsavel: '',
      tipoAcao: '',
      setor: '',
      mes: ''
    });
  };

  const relatoriosFiltrados = useMemo(() => {
    return relatorios.filter(relatorio => {
      if (filtros.responsavel && relatorio.responsavel !== filtros.responsavel) return false;
      if (filtros.tipoAcao && relatorio.tipo_acao !== filtros.tipoAcao) return false;
      if (filtros.setor && relatorio.setor !== filtros.setor) return false;
      if (filtros.mes && relatorio.mes !== parseInt(filtros.mes)) return false;
      return true;
    });
  }, [relatorios, filtros]);

  const obterOpcoesFiltros = useMemo(() => {
    const responsaveis = [
      ...new Map(
        relatorios
          .filter(r => r.responsavel)
          .map(r => [
            r.responsavel,
            {
              uid: r.responsavel,
              nome: r.responsavelNome || 'Usuário não identificado'
            }
          ])
      ).values()
    ];
    const tiposAcao = tiposAcaoOptions.map((o) => o.value);
    const setores = setoresOptions.map((o) => o.value);
    const meses = [...new Set(relatorios.map(r => r.mes))].sort((a, b) => a - b);

    return { responsaveis, tiposAcao, setores, meses };
  }, [relatorios, setoresOptions, tiposAcaoOptions]);

  return {
    relatorios: relatoriosFiltrados,
    loading,
    error,
    filtros,
    handleNew,
    handleEdit,
    confirmDelete,
    cancelDelete,
    executeDelete,
    deleteId,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    user,
    isAdmin
  };
};
