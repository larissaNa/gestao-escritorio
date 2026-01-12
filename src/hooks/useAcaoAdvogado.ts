import { useState, useEffect } from 'react';
import { acaoAdvogadoService } from '@/services/acaoAdvogadoService';
import { AcaoAdvogado } from '@/types';

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
      setError('Erro ao carregar ações dos advogados');
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
      
      return true;
    } catch (err) {
      setError('Erro ao criar ação');
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
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar ação');
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
      
      return true;
    } catch (err) {
      setError('Erro ao excluir ação');
      console.error('Erro ao excluir ação:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const carregarFiltros = async () => {
    try {
      const [advogadosData, areasData] = await Promise.all([
        acaoAdvogadoService.buscarAdvogados(),
        acaoAdvogadoService.buscarAreas()
      ]);
      
      setAdvogados(advogadosData);
      setAreas(areasData);
    } catch (err) {
      console.error('Erro ao carregar filtros:', err);
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
