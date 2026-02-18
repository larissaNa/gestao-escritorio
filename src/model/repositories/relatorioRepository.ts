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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { RelatorioItem } from '@/model/entities';

export class RelatorioRepository {
  private collectionName = 'relatorios';

  async create(dados: Omit<RelatorioItem, 'id' | 'data' | 'mes'>): Promise<string> {
    const dataAtual = new Date();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...dados,
      data: Timestamp.now(),
      mes: dataAtual.getMonth() + 1
    });
    return docRef.id;
  }

  async update(id: string, dados: Partial<RelatorioItem>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, dados);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getById(id: string): Promise<RelatorioItem | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        data: data.data?.toDate() || new Date()
      } as RelatorioItem;
    }
    return null;
  }

  async getAll(): Promise<RelatorioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToRelatorio(querySnapshot.docs);
  }

  async getByResponsavel(responsavel: string): Promise<RelatorioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('responsavel', '==', responsavel),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToRelatorio(querySnapshot.docs);
  }

  async getByTipoAcao(tipoAcao: string): Promise<RelatorioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('tipo_acao', '==', tipoAcao),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToRelatorio(querySnapshot.docs);
  }

  async getBySetor(setor: string): Promise<RelatorioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('setor', '==', setor),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToRelatorio(querySnapshot.docs);
  }

  private mapDocsToRelatorio(docs: any[]): RelatorioItem[] {
    return docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data?.toDate() || new Date()
    })) as RelatorioItem[];
  }
}

export const relatorioRepository = new RelatorioRepository();
