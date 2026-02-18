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
import { AcaoAdvogado } from '@/model/entities';

export class AcaoAdvogadoRepository {
  private collectionName = 'processosClientes';

  async create(dados: Omit<AcaoAdvogado, 'id' | 'dataCadastro'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...dados,
      dataCadastro: Timestamp.now()
    });
    return docRef.id;
  }

  async update(id: string, dados: Partial<AcaoAdvogado>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, dados);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getById(id: string): Promise<AcaoAdvogado | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        cliente: data.cliente,
        advogado: data.advogado,
        area: data.area,
        situacao: data.situacao,
        dataCadastro: data.dataCadastro.toDate(),
        observacoes: data.observacoes,
        valor: data.valor,
        prazo: data.prazo?.toDate()
      };
    }
    return null;
  }

  async getAll(): Promise<AcaoAdvogado[]> {
    const q = query(collection(db, this.collectionName), orderBy('dataCadastro', 'desc'));
    const querySnapshot = await getDocs(q);
    return this.mapDocsToAcaoAdvogado(querySnapshot.docs);
  }

  async getByFilters(filtros: {
    advogado?: string;
    area?: string;
    situacao?: string;
  }): Promise<AcaoAdvogado[]> {
    let q = query(collection(db, this.collectionName), orderBy('dataCadastro', 'desc'));

    if (filtros.advogado) {
      q = query(q, where('advogado', '==', filtros.advogado));
    }
    if (filtros.area) {
      q = query(q, where('area', '==', filtros.area));
    }
    if (filtros.situacao) {
      q = query(q, where('situacao', '==', filtros.situacao));
    }

    const querySnapshot = await getDocs(q);
    return this.mapDocsToAcaoAdvogado(querySnapshot.docs);
  }

  private mapDocsToAcaoAdvogado(docs: any[]): AcaoAdvogado[] {
    return docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        cliente: data.cliente,
        advogado: data.advogado,
        area: data.area,
        situacao: data.situacao,
        dataCadastro: data.dataCadastro.toDate(),
        observacoes: data.observacoes,
        valor: data.valor,
        prazo: data.prazo?.toDate()
      };
    });
  }
}

export const acaoAdvogadoRepository = new AcaoAdvogadoRepository();
