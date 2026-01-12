import { useState, useEffect, useCallback } from 'react';
import { FinanceiroService } from '../services/financeiro.service';
import { Receita, ProjecaoFinanceira, CustoServico, ResumoFinanceiro } from '../types';

export const useFinanceiro = () => {
  const [loading, setLoading] = useState(true);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [projecoes, setProjecoes] = useState<ProjecaoFinanceira[]>([]);
  const [custos, setCustos] = useState<CustoServico[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  
  // Instância do serviço
  const financeiroService = new FinanceiroService();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Simula o ID do usuário logado ou pega do contexto se necessário
      const userId = 'user-123';

      // Busca dados em paralelo
      const [receitasData, projecoesData, custosData] = await Promise.all([
        financeiroService.getReceitas(userId),
        financeiroService.getProjecoes(userId),
        financeiroService.getCustos(userId)
      ]);

      setReceitas(receitasData);
      setProjecoes(projecoesData);
      setCustos(custosData);

      // Calcula resumo usando a regra de negócio do serviço
      const resumoData = financeiroService.calculateResumo(receitasData, custosData, projecoesData);
      setResumo(resumoData);

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addReceita = async (receita: Omit<Receita, 'id'>) => {
    try {
      await financeiroService.addReceita(receita);
      await loadData(); // Recarrega os dados após adicionar
      return true;
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      throw error;
    }
  };

  const addProjecao = async (projecao: Omit<ProjecaoFinanceira, 'id'>) => {
    try {
      await financeiroService.addProjecao(projecao);
      await loadData();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar projeção:', error);
      throw error;
    }
  };

  const addCusto = async (custo: Omit<CustoServico, 'id'>) => {
    try {
      await financeiroService.addCusto(custo);
      await loadData();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar custo:', error);
      throw error;
    }
  };

  return {
    loading,
    receitas,
    projecoes,
    custos,
    resumo,
    refresh: loadData,
    addReceita,
    addProjecao,
    addCusto
  };
};
