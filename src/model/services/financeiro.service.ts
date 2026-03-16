import { Receita, CustoServico, ResumoFinanceiro } from '@/model/entities';
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

  calculateResumo(receitasData: Receita[], custosData: CustoServico[]): ResumoFinanceiro {
    const receitaTotal = receitasData.reduce((acc, curr) => acc + curr.valorTotal, 0);
    const receitaRecebida = receitasData.reduce((acc, curr) => acc + curr.valorPago, 0);
    const receitaPendente = receitasData.reduce((acc, curr) => acc + curr.valorAberto, 0);
    const custosTotais = custosData.reduce((acc, curr) => acc + curr.valor, 0);
    const resultadoLiquido = receitaRecebida - custosTotais;

    return {
      receitaTotal,
      receitaRecebida,
      receitaPendente,
      custosTotais,
      resultadoLiquido,
    };
  }
  
  // --- Receitas ---

  async getReceitas(userId?: string, input?: { escritorio?: string }): Promise<Receita[]> {
    try {
      // Por enquanto traz tudo, depois pode filtrar por userId se necessário
      return await financeiroRepository.getReceitas(input);
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

  // --- Custos ---

  async getCustos(userId?: string, input?: { escritorio?: string }): Promise<CustoServico[]> {
    try {
      return await financeiroRepository.getCustos(input);
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
