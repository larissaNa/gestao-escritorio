import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, getDocs, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { AcaoAdvogado } from '@/types';

export class AcaoAdvogadoService {
  private collectionName = 'processosClientes';

  async criarAcao(dados: Omit<AcaoAdvogado, 'id' | 'dataCadastro'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...dados,
      dataCadastro: Timestamp.now()
    });
    return docRef.id;
  }

  async atualizarAcao(id: string, dados: Partial<AcaoAdvogado>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, dados);
  }

  async excluirAcao(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async buscarPorId(id: string): Promise<AcaoAdvogado | null> {
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

  async buscarTodos(): Promise<AcaoAdvogado[]> {
    const q = query(collection(db, this.collectionName), orderBy('dataCadastro', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
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

  async buscarComFiltros(filtros: {
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
    
    return querySnapshot.docs.map(doc => {
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

  async buscarAdvogados(): Promise<string[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    const advogados = new Set<string>();
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.advogado) {
        advogados.add(data.advogado);
      }
    });
    
    return Array.from(advogados).sort();
  }

  async buscarAreas(): Promise<string[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    const areas = new Set<string>();
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.area) {
        areas.add(data.area);
      }
    });
    
    return Array.from(areas).sort();
  }
}

export const acaoAdvogadoService = new AcaoAdvogadoService();
