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
  getDoc
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { ServicoItem } from '@/model/entities';

export class ServicoRepository {
  private collectionName = 'servicos';

  async create(dados: Omit<ServicoItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), dados);
    return docRef.id;
  }

  async update(id: string, dados: Partial<ServicoItem>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, dados);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getAll(): Promise<ServicoItem[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('area', 'asc'),
      orderBy('tipoAcao', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToServicos(querySnapshot.docs);
  }

  async getByArea(area: string): Promise<ServicoItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('area', '==', area),
      orderBy('tipoAcao', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToServicos(querySnapshot.docs);
  }

  async getByAdvogado(advogado: string): Promise<ServicoItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('advogadoResponsavel', '==', advogado),
      orderBy('area', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToServicos(querySnapshot.docs);
  }

  async getById(id: string): Promise<ServicoItem | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ServicoItem;
    }
    return null;
  }

  private mapDocsToServicos(docs: any[]): ServicoItem[] {
    return docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServicoItem[];
  }
}

export const servicoRepository = new ServicoRepository();
