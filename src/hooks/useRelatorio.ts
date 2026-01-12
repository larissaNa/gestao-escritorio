import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { relatorioService } from '@/services/relatorioService';
import { colaboradorService } from '@/services/colaboradorService';
import { RelatorioItem } from '@/types';
import { testFirebaseConnection, logFirebaseError } from '@/utils/debug';

export const useRelatorio = () => {
  const { user } = useAuth();
  const [relatorios, setRelatorios] = useState<RelatorioItem[]>([]);
  const [loading, setLoading] = useState(false); // lista
  const [saving, setSaving] = useState(false);   // salvar/editar/excluir
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    responsavel: '',
    tipoAcao: '',
    setor: '',
    mes: ''
  });

  // Carregar todos os relatórios
  const carregarRelatorios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo relatório
  const criarRelatorio = async (dados: Omit<RelatorioItem, 'id' | 'data' | 'mes'>) => {
    if (!user) {
      console.error('Usuário não autenticado');
      setError('Usuário não autenticado');
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const connectionTest = await testFirebaseConnection();
      if (!connectionTest) {
        setError('Problema de conexão com o Firebase');
        return false;
      }

      console.log('Criando relatório com dados:', dados);
      await relatorioService.criarRelatorio(dados);
      await carregarRelatorios();
      return true;
    } catch (err) {
      logFirebaseError(err, 'criarRelatorio');
      setError(err instanceof Error ? err.message : 'Erro ao criar relatório');
      console.error('Erro ao criar relatório:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Atualizar relatório
  const atualizarRelatorio = async (id: string, dados: Partial<RelatorioItem>) => {
    setSaving(true);
    setError(null);
    try {
      await relatorioService.atualizarRelatorio(id, dados);
      await carregarRelatorios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar relatório');
      console.error('Erro ao atualizar relatório:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Excluir relatório
  const excluirRelatorio = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await relatorioService.excluirRelatorio(id);
      await carregarRelatorios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir relatório');
      console.error('Erro ao excluir relatório:', err);
      return false;
    } finally {
      setSaving(false);
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

  const relatoriosFiltrados = relatorios.filter(relatorio => {
    if (filtros.responsavel && relatorio.responsavel !== filtros.responsavel) return false;
    if (filtros.tipoAcao && relatorio.tipo_acao !== filtros.tipoAcao) return false;
    if (filtros.setor && relatorio.setor !== filtros.setor) return false;
    if (filtros.mes && relatorio.mes !== parseInt(filtros.mes)) return false;
    return true;
  });

  const obterOpcoesFiltros = () => {
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
    const meses = [...new Set(relatorios.map(r => r.mes))].sort();

    return { responsaveis, tiposAcao, setores, meses };
  };

  useEffect(() => {
    if (user) {
      carregarRelatorios();
    }
  }, [user]);

  return {
    relatorios: relatoriosFiltrados,
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
  };
};
