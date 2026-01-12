import { useState, useEffect } from 'react';
import { preCadastroService } from '@/services/preCadastroService';
import { PreCadastro } from '@/types';

export const usePreCadastro = () => {
  const [preCadastros, setPreCadastros] = useState<PreCadastro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<PreCadastro['status'] | 'todos'>('todos');

  // Carregar todos os pré-cadastros
  const carregarPreCadastros = async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await preCadastroService.buscarTodos();
      setPreCadastros(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pré-cadastros');
      console.error('Erro ao carregar pré-cadastros:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criar novo pré-cadastro
  const criarPreCadastro = async (dados: Omit<PreCadastro, 'id' | 'dataCadastro'>) => {
    setLoading(true);
    setError(null);
    try {
      await preCadastroService.criarPreCadastro(dados);
      await carregarPreCadastros(); // Recarrega a lista
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pré-cadastro');
      console.error('Erro ao criar pré-cadastro:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status do pré-cadastro
  const atualizarStatus = async (id: string, status: PreCadastro['status']) => {
    setLoading(true);
    setError(null);
    try {
      await preCadastroService.atualizarStatus(id, status);
      await carregarPreCadastros(); // Recarrega a lista
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
      console.error('Erro ao atualizar status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pré-cadastros por status
  const filtrarPorStatus = (status: PreCadastro['status'] | 'todos') => {
    setFiltroStatus(status);
  };

  // Obter pré-cadastros filtrados
  const preCadastrosFiltrados = filtroStatus === 'todos' 
    ? preCadastros 
    : preCadastros.filter(pc => pc.status === filtroStatus);

  // Carregar dados iniciais
  useEffect(() => {
    carregarPreCadastros();
  }, []);

  return {
    preCadastros: preCadastrosFiltrados,
    loading,
    error,
    filtroStatus,
    criarPreCadastro,
    atualizarStatus,
    filtrarPorStatus,
    carregarPreCadastros
  };
};
