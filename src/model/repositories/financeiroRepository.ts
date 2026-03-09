import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
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

  async updateReceita(id: string, data: Partial<Receita>): Promise<void> {
    const docRef = doc(this.receitasCollection, id);
    const updateData: any = { ...data };
    if (data.dataVencimento) {
      updateData.dataVencimento = Timestamp.fromDate(data.dataVencimento);
    }
    await updateDoc(docRef, updateData);
  }

  async deleteReceita(id: string): Promise<void> {
    const docRef = doc(this.receitasCollection, id);
    await deleteDoc(docRef);
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

  async updateProjecao(id: string, data: Partial<ProjecaoFinanceira>): Promise<void> {
    const docRef = doc(this.projecoesCollection, id);
    const updateData: any = { ...data };
    if (data.dataPrevista) {
      updateData.dataPrevista = Timestamp.fromDate(data.dataPrevista);
    }
    await updateDoc(docRef, updateData);
  }

  async deleteProjecao(id: string): Promise<void> {
    const docRef = doc(this.projecoesCollection, id);
    await deleteDoc(docRef);
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

  async updateCusto(id: string, data: Partial<CustoServico>): Promise<void> {
    const docRef = doc(this.custosCollection, id);
    const updateData: any = { ...data };
    if (data.data) {
      updateData.data = Timestamp.fromDate(data.data);
    }
    await updateDoc(docRef, updateData);
  }

  async deleteCusto(id: string): Promise<void> {
    const docRef = doc(this.custosCollection, id);
    await deleteDoc(docRef);
  }
}

export const financeiroRepository = new FinanceiroRepository();
