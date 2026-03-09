import { Receita, ProjecaoFinanceira, CustoServico, ResumoFinanceiro } from '@/model/entities';
import { financeiroRepository } from '@/model/repositories/financeiroRepository';

export class FinanceiroService {
  async addCusto(custo: Omit<CustoServico, "id">): Promise<string> {
    try {
      return await financeiroRepository.addCusto(custo);
    } catch (error) {
      console.error('Erro ao adicionar custo:', error);
      throw error;
    }
  }

  calculateResumo(receitasData: Receita[], custosData: CustoServico[], projecoesData: ProjecaoFinanceira[]): ResumoFinanceiro {
    const receitaTotal = receitasData.reduce((acc, curr) => acc + curr.valorTotal, 0);
    const receitaRecebida = receitasData.reduce((acc, curr) => acc + curr.valorPago, 0);
    const receitaPendente = receitasData.reduce((acc, curr) => acc + curr.valorAberto, 0);
    const custosTotais = custosData.reduce((acc, curr) => acc + curr.valor, 0);
    const resultadoLiquido = receitaRecebida - custosTotais;
    const projecaoFutura = projecoesData.reduce((acc, curr) => acc + curr.valorEstimado, 0);

    return {
      receitaTotal,
      receitaRecebida,
      receitaPendente,
      custosTotais,
      resultadoLiquido,
      projecaoFutura
    };
  }
  
  // --- Receitas ---

  async getReceitas(userId?: string): Promise<Receita[]> {
    try {
      // Por enquanto traz tudo, depois pode filtrar por userId se necessário
      return await financeiroRepository.getReceitas();
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      return [];
    }
  }

  async addReceita(receita: Omit<Receita, 'id'>): Promise<string> {
    try {
      return await financeiroRepository.addReceita(receita);
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      throw error;
    }
  }

  async updateReceita(id: string, data: Partial<Receita>): Promise<void> {
    try {
      await financeiroRepository.updateReceita(id, data);
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      throw error;
    }
  }

  async deleteReceita(id: string): Promise<void> {
    try {
      await financeiroRepository.deleteReceita(id);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      throw error;
    }
  }

  // --- Projeções ---

  async getProjecoes(userId?: string): Promise<ProjecaoFinanceira[]> {
    try {
      return await financeiroRepository.getProjecoes();
    } catch (error) {
      console.error('Erro ao buscar projeções:', error);
      return [];
    }
  }

  async addProjecao(projecao: Omit<ProjecaoFinanceira, 'id'>): Promise<string> {
    try {
      return await financeiroRepository.addProjecao(projecao);
    } catch (error) {
      console.error('Erro ao adicionar projeção:', error);
      throw error;
    }
  }

  async updateProjecao(id: string, data: Partial<ProjecaoFinanceira>): Promise<void> {
    try {
      await financeiroRepository.updateProjecao(id, data);
    } catch (error) {
      console.error('Erro ao atualizar projeção:', error);
      throw error;
    }
  }

  async deleteProjecao(id: string): Promise<void> {
    try {
      await financeiroRepository.deleteProjecao(id);
    } catch (error) {
      console.error('Erro ao excluir projeção:', error);
      throw error;
    }
  }

  // --- Custos ---

  async getCustos(userId?: string): Promise<CustoServico[]> {
    try {
      return await financeiroRepository.getCustos();
    } catch (error) {
      console.error('Erro ao buscar custos:', error);
      return [];
    }
  }

  async updateCusto(id: string, data: Partial<CustoServico>): Promise<void> {
    try {
      await financeiroRepository.updateCusto(id, data);
    } catch (error) {
      console.error('Erro ao atualizar custo:', error);
      throw error;
    }
  }

  async deleteCusto(id: string): Promise<void> {
    try {
      await financeiroRepository.deleteCusto(id);
    } catch (error) {
      console.error('Erro ao excluir custo:', error);
      throw error;
    }
  }
}

export const financeiroService = new FinanceiroService();
