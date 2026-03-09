import { useState, useEffect, useCallback } from 'react';
import { FinanceiroService } from '@/model/services/financeiro.service';
import { Receita, ProjecaoFinanceira, CustoServico, ResumoFinanceiro } from '@/model/entities';
import { toast } from 'sonner';

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
      toast.error('Erro ao carregar dados financeiros');
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
      toast.success('Receita adicionada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      toast.error('Erro ao adicionar receita');
      throw error;
    }
  };

  const updateReceita = async (id: string, data: Partial<Receita>) => {
    try {
      await financeiroService.updateReceita(id, data);
      await loadData();
      toast.success('Receita atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      toast.error('Erro ao atualizar receita');
      throw error;
    }
  };

  const deleteReceita = async (id: string) => {
    try {
      await financeiroService.deleteReceita(id);
      await loadData();
      toast.success('Receita excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast.error('Erro ao excluir receita');
      throw error;
    }
  };

  const addProjecao = async (projecao: Omit<ProjecaoFinanceira, 'id'>) => {
    try {
      await financeiroService.addProjecao(projecao);
      await loadData();
      toast.success('Projeção adicionada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar projeção:', error);
      toast.error('Erro ao adicionar projeção');
      throw error;
    }
  };

  const updateProjecao = async (id: string, data: Partial<ProjecaoFinanceira>) => {
    try {
      await financeiroService.updateProjecao(id, data);
      await loadData();
      toast.success('Projeção atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar projeção:', error);
      toast.error('Erro ao atualizar projeção');
      throw error;
    }
  };

  const deleteProjecao = async (id: string) => {
    try {
      await financeiroService.deleteProjecao(id);
      await loadData();
      toast.success('Projeção excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir projeção:', error);
      toast.error('Erro ao excluir projeção');
      throw error;
    }
  };

  const addCusto = async (custo: Omit<CustoServico, 'id'>) => {
    try {
      await financeiroService.addCusto(custo);
      await loadData();
      toast.success('Custo adicionado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar custo:', error);
      toast.error('Erro ao adicionar custo');
      throw error;
    }
  };

  const updateCusto = async (id: string, data: Partial<CustoServico>) => {
    try {
      await financeiroService.updateCusto(id, data);
      await loadData();
      toast.success('Custo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar custo:', error);
      toast.error('Erro ao atualizar custo');
      throw error;
    }
  };

  const deleteCusto = async (id: string) => {
    try {
      await financeiroService.deleteCusto(id);
      await loadData();
      toast.success('Custo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir custo:', error);
      toast.error('Erro ao excluir custo');
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
    updateReceita,
    deleteReceita,
    addProjecao,
    updateProjecao,
    deleteProjecao,
    addCusto,
    updateCusto,
    deleteCusto
  };
};
