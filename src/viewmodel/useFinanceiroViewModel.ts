import { useState, useEffect, useCallback, useMemo } from 'react';
import { FinanceiroService } from '@/model/services/financeiro.service';
import { Receita, CustoServico, ResumoFinanceiro } from '@/model/entities';
import { toast } from 'sonner';
import { useConfigListOptions } from '@/viewmodel/configLists/useConfigListOptions';

export const useFinanceiro = () => {
  const [loading, setLoading] = useState(true);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [custos, setCustos] = useState<CustoServico[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [escritorio, setEscritorio] = useState<string>('');
  
  // Instância do serviço
  const financeiroService = useMemo(() => new FinanceiroService(), []);

  const { options: escritoriosOptions, loading: loadingEscritorios } = useConfigListOptions('escritorios', {
    activeOnly: true,
  });

  useEffect(() => {
    if (!escritorio && escritoriosOptions.length > 0) {
      setEscritorio(escritoriosOptions[0].value);
    }
  }, [escritorio, escritoriosOptions]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Simula o ID do usuário logado ou pega do contexto se necessário
      const userId = 'user-123';

      if (!escritorio) {
        setReceitas([]);
        setCustos([]);
        setResumo(null);
        return;
      }

      // Busca dados em paralelo
      const [receitasData, custosData] = await Promise.all([
        financeiroService.getReceitas(userId, { escritorio }),
        financeiroService.getCustos(userId, { escritorio })
      ]);

      setReceitas(receitasData);
      setCustos(custosData);

      // Calcula resumo usando a regra de negócio do serviço
      const resumoData = financeiroService.calculateResumo(receitasData, custosData);
      setResumo(resumoData);

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [escritorio, financeiroService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addReceita = async (receita: Omit<Receita, 'id'>) => {
    try {
      const escritorioToUse = receita.escritorio ?? escritorio;
      if (!escritorioToUse) throw new Error('Selecione um escritório');
      await financeiroService.addReceita({ ...receita, escritorio: escritorioToUse });
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

  const addCusto = async (custo: Omit<CustoServico, 'id'>) => {
    try {
      const escritorioToUse = custo.escritorio ?? escritorio;
      if (!escritorioToUse) throw new Error('Selecione um escritório');
      await financeiroService.addCusto({ ...custo, escritorio: escritorioToUse });
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
    custos,
    resumo,
    escritorio,
    setEscritorio,
    escritoriosOptions,
    loadingEscritorios,
    refresh: loadData,
    addReceita,
    updateReceita,
    deleteReceita,
    addCusto,
    updateCusto,
    deleteCusto
  };
};
