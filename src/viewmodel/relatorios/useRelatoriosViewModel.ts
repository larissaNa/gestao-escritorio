import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { relatorioService } from '@/model/services/relatorioService';
import { colaboradorService } from '@/model/services/colaboradorService';
import { RelatorioItem } from '@/model/entities';

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
    const tiposAcao = [...new Set(relatorios.map(r => r.tipo_acao).filter(Boolean))];
    const setores = [...new Set(relatorios.map(r => r.setor).filter(Boolean))];
    const meses = [...new Set(relatorios.map(r => r.mes))].sort((a, b) => a - b);

    return { responsaveis, tiposAcao, setores, meses };
  }, [relatorios]);

  // Resumo de pontos (Admin only)
  // const resumoPontos = useMemo(() => {
  //   if (user?.role !== "admin") return [];

  //   const mapa = new Map<string, { nome: string; pontos: number }>();

  //   relatorios.forEach((rel) => {
  //     const nome = rel.responsavelNome || rel.responsavel;
  //     const pts = rel.pontos || 0;

  //     if (!mapa.has(nome)) {
  //       mapa.set(nome, { nome, pontos: pts });
  //     } else {
  //       mapa.get(nome)!.pontos += pts;
  //     }
  //   });

  //   return Array.from(mapa.values());
  // }, [relatorios, user]);

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
    // resumoPontos,
    user,
    isAdmin
  };
};
