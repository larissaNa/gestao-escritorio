import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { acaoAdvogadoService } from '@/model/services/acaoAdvogadoService';
import { AcaoAdvogado } from '@/model/entities';

export const useAcaoAdvogado = () => {
  const [acoes, setAcoes] = useState<AcaoAdvogado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advogados, setAdvogados] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);

  const carregarAcoes = async (filtros?: {
    advogado?: string;
    area?: string;
    situacao?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const dados = filtros 
        ? await acaoAdvogadoService.buscarComFiltros(filtros)
        : await acaoAdvogadoService.buscarTodos();
      
      setAcoes(dados);
    } catch (err) {
      const msg = 'Erro ao carregar ações dos advogados';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao carregar ações:', err);
    } finally {
      setLoading(false);
    }
  };

  const criarAcao = async (dados: Omit<AcaoAdvogado, 'id' | 'dataCadastro'>) => {
    try {
      setLoading(true);
      setError(null);
      
      await acaoAdvogadoService.criarAcao(dados);
      await carregarAcoes();
      
      toast.success('Ação criada com sucesso!');
      return true;
    } catch (err) {
      const msg = 'Erro ao criar ação';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao criar ação:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarAcao = async (id: string, dados: Partial<AcaoAdvogado>) => {
    try {
      setLoading(true);
      setError(null);
      
      await acaoAdvogadoService.atualizarAcao(id, dados);
      await carregarAcoes();
      
      toast.success('Ação atualizada com sucesso!');
      return true;
    } catch (err) {
      const msg = 'Erro ao atualizar ação';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao atualizar ação:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const excluirAcao = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await acaoAdvogadoService.excluirAcao(id);
      await carregarAcoes();
      
      toast.success('Ação excluída com sucesso!');
      return true;
    } catch (err) {
      const msg = 'Erro ao excluir ação';
      setError(msg);
      toast.error(msg);
      console.error('Erro ao excluir ação:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const carregarFiltros = async () => {
    try {
      const [advogadosData, areasData] = await Promise.all([
        acaoAdvogadoService.buscarTodos(),
        acaoAdvogadoService.buscarAreas()
      ]);
      
      setAdvogados([...new Set(advogadosData.map(acao => acao.advogado))]);
      setAreas(areasData);
    } catch (err) {
      console.error('Erro ao carregar filtros:', err);
      // Não exibimos toast aqui para não poluir a UI, pois é um carregamento secundário
    }
  };

  useEffect(() => {
    carregarAcoes();
    carregarFiltros();
  }, []);

  return {
    acoes,
    loading,
    error,
    advogados,
    areas,
    carregarAcoes,
    criarAcao,
    atualizarAcao,
    excluirAcao,
    carregarFiltros
  };
};


