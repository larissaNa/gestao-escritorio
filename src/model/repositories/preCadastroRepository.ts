import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { PreCadastro } from '@/model/entities';

export class PreCadastroRepository {
  private collectionName = 'cadastrosRecepcao';

  async create(dados: Omit<PreCadastro, 'id' | 'dataCadastro'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...dados,
      dataCadastro: Timestamp.now()
    });
    return docRef.id;
  }

  async updateStatus(id: string, status: PreCadastro['status']): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, { status });
  }

  async getAll(): Promise<PreCadastro[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('dataCadastro', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToPreCadastro(querySnapshot.docs);
  }

  async getByStatus(status: PreCadastro['status']): Promise<PreCadastro[]> {
    const q = query(
      collection(db, this.collectionName),
      where('status', '==', status),
      orderBy('dataCadastro', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToPreCadastro(querySnapshot.docs);
  }

  async getByResponsavel(responsavel: string): Promise<PreCadastro[]> {
    const q = query(
      collection(db, this.collectionName),
      where('responsavel', '==', responsavel),
      orderBy('dataCadastro', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToPreCadastro(querySnapshot.docs);
  }

  private mapDocsToPreCadastro(docs: any[]): PreCadastro[] {
    return docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
    })) as PreCadastro[];
  }
}

export const preCadastroRepository = new PreCadastroRepository();
