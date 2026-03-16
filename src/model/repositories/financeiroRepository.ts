import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { Receita, CustoServico } from '@/model/entities';

export class FinanceiroRepository {
  private receitasCollection = collection(db, 'financeiro_receitas');
  private projecoesCollection = collection(db, 'financeiro_projecoes');
  private custosCollection = collection(db, 'financeiro_custos');

  // --- Receitas ---

  async getReceitas(input?: { escritorio?: string }): Promise<Receita[]> {
    const q = input?.escritorio
      ? query(this.receitasCollection, where('escritorio', '==', input.escritorio))
      : query(this.receitasCollection, orderBy('dataVencimento', 'asc'));
    const snapshot = await getDocs(q);
    
    const items = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown> & { dataVencimento?: { toDate?: () => Date } };
      return {
        id: doc.id,
        ...data,
        dataVencimento: data.dataVencimento?.toDate?.() || new Date(),
      } as Receita;
    });

    if (input?.escritorio) {
      items.sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());
    }

    return items;
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
    const updateData: Record<string, unknown> = { ...data };
    if (data.dataVencimento) {
      updateData.dataVencimento = Timestamp.fromDate(data.dataVencimento);
    }
    await updateDoc(docRef, updateData);
  }

  async deleteReceita(id: string): Promise<void> {
    const docRef = doc(this.receitasCollection, id);
    await deleteDoc(docRef);
  }

  // --- Custos ---

  async getCustos(input?: { escritorio?: string }): Promise<CustoServico[]> {
    const q = input?.escritorio
      ? query(this.custosCollection, where('escritorio', '==', input.escritorio))
      : query(this.custosCollection, orderBy('data', 'desc'));
    const snapshot = await getDocs(q);

    const items = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown> & { data?: { toDate?: () => Date } };
      return {
        id: doc.id,
        ...data,
        data: data.data?.toDate?.() || new Date(),
      } as CustoServico;
    });

    if (input?.escritorio) {
      items.sort((a, b) => b.data.getTime() - a.data.getTime());
    }

    return items;
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
    const updateData: Record<string, unknown> = { ...data };
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
