import { useState, useEffect } from 'react';
import { servicoService } from '@/services/servicoService';
import { ServicoItem } from '@/types';

export const useServico = () => {
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    area: '',
    advogado: ''
  });

  // Carregar todos os serviços
  const carregarServicos = async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await servicoService.buscarTodos();
      setServicos(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar serviços');
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criar novo serviço
  const criarServico = async (dados: Omit<ServicoItem, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      await servicoService.criarServico(dados);
      await carregarServicos(); // Recarrega a lista
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar serviço');
      console.error('Erro ao criar serviço:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar serviço
  const atualizarServico = async (id: string, dados: Partial<ServicoItem>) => {
    setLoading(true);
    setError(null);
    try {
      await servicoService.atualizarServico(id, dados);
      await carregarServicos(); // Recarrega a lista
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar serviço');
      console.error('Erro ao atualizar serviço:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Excluir serviço
  const excluirServico = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await servicoService.excluirServico(id);
      await carregarServicos(); // Recarrega a lista
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir serviço');
      console.error('Erro ao excluir serviço:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = (novosFiltros: Partial<typeof filtros>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      area: '',
      advogado: ''
    });
  };

  // Obter serviços filtrados
  const servicosFiltrados = servicos.filter(servico => {
    if (filtros.area && servico.area !== filtros.area) return false;
    if (filtros.advogado && servico.advogadoResponsavel !== filtros.advogado) return false;
    return true;
  });

  // Obter opções para filtros
  const obterOpcoesFiltros = () => {
    const areas = [...new Set(servicos.map(s => s.area))];
    const advogados = [...new Set(servicos.map(s => s.advogadoResponsavel))];

    return {
      areas,
      advogados
    };
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarServicos();
  }, []);

  return {
    servicos: servicosFiltrados,
    loading,
    error,
    filtros,
    criarServico,
    atualizarServico,
    excluirServico,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    carregarServicos
  };
};
