import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { RelatorioDiarioItem } from '@/model/entities';

export class RelatorioDiarioRepository {
  private collectionName = 'relatorios_diarios';

  async create(dados: Omit<RelatorioDiarioItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const dataTimestamp = dados.data instanceof Date ? Timestamp.fromDate(dados.data) : Timestamp.now();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...dados,
      data: dataTimestamp,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async update(id: string, dados: Partial<RelatorioDiarioItem>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const payload: Record<string, unknown> = {
      ...dados,
      updatedAt: Timestamp.now(),
    };

    if (dados.data && dados.data instanceof Date) {
      payload.data = Timestamp.fromDate(dados.data);
    }

    delete payload.id;
    await updateDoc(docRef, payload);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getById(id: string): Promise<RelatorioDiarioItem | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        data: data.data?.toDate ? data.data.toDate() : (data.data ? new Date(data.data) : new Date()),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : undefined),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined),
      } as RelatorioDiarioItem;
    }
    return null;
  }

  async getAll(): Promise<RelatorioDiarioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToRelatorio(querySnapshot.docs);
  }

  async getByResponsavel(responsavelId: string): Promise<RelatorioDiarioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('responsavelId', '==', responsavelId),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToRelatorio(querySnapshot.docs);
  }

  private mapDocsToRelatorio(docs: any[]): RelatorioDiarioItem[] {
    return docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        data: data.data?.toDate ? data.data.toDate() : (data.data ? new Date(data.data) : new Date()),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : undefined),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined),
      } as RelatorioDiarioItem;
    });
  }
}

export const relatorioDiarioRepository = new RelatorioDiarioRepository();
