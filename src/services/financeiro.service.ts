import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Receita, ProjecaoFinanceira, CustoServico, ResumoFinanceiro } from '@/types';

export class FinanceiroService {
  private receitasCollection = collection(db, 'financeiro_receitas');
  private projecoesCollection = collection(db, 'financeiro_projecoes');
  private custosCollection = collection(db, 'financeiro_custos');

  // --- Receitas ---

  async getReceitas(userId?: string): Promise<Receita[]> {
    try {
      // Por enquanto traz tudo, depois pode filtrar por userId se necessário
      const q = query(this.receitasCollection, orderBy('dataVencimento', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dataVencimento: data.dataVencimento?.toDate() || new Date()
        } as Receita;
      });
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      return [];
    }
  }

  async addReceita(receita: Omit<Receita, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.receitasCollection, {
        ...receita,
        dataVencimento: Timestamp.fromDate(receita.dataVencimento),
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      throw error;
    }
  }

  // --- Projeções ---

  async getProjecoes(userId?: string): Promise<ProjecaoFinanceira[]> {
    try {
      const q = query(this.projecoesCollection, orderBy('dataPrevista', 'asc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dataPrevista: data.dataPrevista?.toDate() || new Date()
        } as ProjecaoFinanceira;
      });
    } catch (error) {
      console.error('Erro ao buscar projeções:', error);
      return [];
    }
  }

  async addProjecao(projecao: Omit<ProjecaoFinanceira, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.projecoesCollection, {
        ...projecao,
        dataPrevista: Timestamp.fromDate(projecao.dataPrevista),
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar projeção:', error);
      throw error;
    }
  }

  // --- Custos ---

  async getCustos(userId?: string): Promise<CustoServico[]> {
    try {
      const q = query(this.custosCollection, orderBy('data', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          data: data.data?.toDate() || new Date()
        } as CustoServico;
      });
    } catch (error) {
      console.error('Erro ao buscar custos:', error);
      return [];
    }
  }

  async addCusto(custo: Omit<CustoServico, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.custosCollection, {
        ...custo,
        data: Timestamp.fromDate(custo.data),
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar custo:', error);
      throw error;
    }
  }

  // --- Resumo ---

  calculateResumo(receitas: Receita[], custos: CustoServico[], projecoes: ProjecaoFinanceira[]): ResumoFinanceiro {
    const receitaTotal = receitas.reduce((acc, curr) => acc + curr.valorTotal, 0);
    const receitaRecebida = receitas.reduce((acc, curr) => acc + curr.valorPago, 0);
    const receitaPendente = receitas.reduce((acc, curr) => acc + curr.valorAberto, 0);
    const custosTotais = custos.reduce((acc, curr) => acc + curr.valor, 0);
    const projecaoFutura = projecoes.reduce((acc, curr) => acc + curr.valorEstimado, 0);
    
    const resultadoLiquido = receitaRecebida - custosTotais;

    return {
      receitaTotal,
      receitaRecebida,
      receitaPendente,
      custosTotais,
      resultadoLiquido,
      projecaoFutura
    };
  }
}

export const financeiroService = new FinanceiroService();
