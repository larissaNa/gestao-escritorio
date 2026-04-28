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
import { normalizeDateOnly } from '@/lib/utils';

export class FinanceiroRepository {
  private receitasCollection = collection(db, 'financeiro_receitas');
  private projecoesCollection = collection(db, 'financeiro_projecoes');
  private custosCollection = collection(db, 'financeiro_custos');

  // --- Receitas ---

  async getReceitas(input?: { escritorio?: string }): Promise<Receita[]> {
    const q = input?.escritorio
      ? query(this.receitasCollection, where('escritorio', '==', input.escritorio))
      : query(this.receitasCollection, orderBy('dataVencimento', 'desc'));
    const snapshot = await getDocs(q);
    
    const items = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown> & { 
        dataVencimento?: { toDate?: () => Date },
        createdAt?: { toDate?: () => Date }
      };
      return {
        id: doc.id,
        ...data,
        dataVencimento: data.dataVencimento?.toDate ? normalizeDateOnly(data.dataVencimento.toDate()) : new Date(),
        createdAtDate: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
      } as Receita & { createdAtDate?: Date };
    });

    // Ordenação manual para garantir consistência (especialmente quando filtrado por escritório)
    items.sort((a, b) => {
      const dateA = a.dataVencimento.getTime();
      const dateB = b.dataVencimento.getTime();
      if (dateA !== dateB) return dateB - dateA; // Data mais recente primeiro

      // Se as datas forem iguais, ordena por data de criação (se disponível)
      const createA = a.createdAtDate?.getTime() ?? 0;
      const createB = b.createdAtDate?.getTime() ?? 0;
      return createB - createA;
    });

    return items as Receita[];
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
      const data = doc.data() as Record<string, unknown> & { 
        data?: { toDate?: () => Date },
        createdAt?: { toDate?: () => Date }
      };
      return {
        id: doc.id,
        ...data,
        data: data.data?.toDate ? normalizeDateOnly(data.data.toDate()) : new Date(),
        createdAtDate: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
      } as CustoServico & { createdAtDate?: Date };
    });

    // Ordenação manual para garantir consistência (especialmente quando filtrado por escritório)
    items.sort((a, b) => {
      const dateA = a.data.getTime();
      const dateB = b.data.getTime();
      if (dateA !== dateB) return dateB - dateA; // Data mais recente primeiro

      // Se as datas forem iguais, ordena por data de criação (se disponível)
      const createA = a.createdAtDate?.getTime() ?? 0;
      const createB = b.createdAtDate?.getTime() ?? 0;
      return createB - createA;
    });

    return items as CustoServico[];
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
