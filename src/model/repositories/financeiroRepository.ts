import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { Receita, ProjecaoFinanceira, CustoServico } from '@/model/entities';

export class FinanceiroRepository {
  private receitasCollection = collection(db, 'financeiro_receitas');
  private projecoesCollection = collection(db, 'financeiro_projecoes');
  private custosCollection = collection(db, 'financeiro_custos');

  // --- Receitas ---

  async getReceitas(): Promise<Receita[]> {
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
  }

  async addReceita(receita: Omit<Receita, 'id'>): Promise<string> {
    const docRef = await addDoc(this.receitasCollection, {
      ...receita,
      dataVencimento: Timestamp.fromDate(receita.dataVencimento),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  // --- Projeções ---

  async getProjecoes(): Promise<ProjecaoFinanceira[]> {
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
  }

  async addProjecao(projecao: Omit<ProjecaoFinanceira, 'id'>): Promise<string> {
    const docRef = await addDoc(this.projecoesCollection, {
      ...projecao,
      dataPrevista: Timestamp.fromDate(projecao.dataPrevista),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  // --- Custos ---

  async getCustos(): Promise<CustoServico[]> {
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
  }

  async addCusto(custo: Omit<CustoServico, 'id'>): Promise<string> {
    const docRef = await addDoc(this.custosCollection, {
      ...custo,
      data: Timestamp.fromDate(custo.data),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }
}

export const financeiroRepository = new FinanceiroRepository();
