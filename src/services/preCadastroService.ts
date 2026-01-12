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
import { db } from './firebase';
import { PreCadastro } from '@/types';

export class PreCadastroService {
  private collectionName = 'cadastrosRecepcao';

  // Criar novo pré-cadastro
  async criarPreCadastro(dados: Omit<PreCadastro, 'id' | 'dataCadastro'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...dados,
      dataCadastro: Timestamp.now()
    });
    return docRef.id;
  }

  // Atualizar status do pré-cadastro
  async atualizarStatus(id: string, status: PreCadastro['status']): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, { status });
  }

  // Buscar todos os pré-cadastros
  async buscarTodos(): Promise<PreCadastro[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('dataCadastro', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
    })) as PreCadastro[];
  }

  // Buscar pré-cadastros por status
  async buscarPorStatus(status: PreCadastro['status']): Promise<PreCadastro[]> {
    const q = query(
      collection(db, this.collectionName),
      where('status', '==', status),
      orderBy('dataCadastro', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
    })) as PreCadastro[];
  }

  // Buscar pré-cadastros por responsável
  async buscarPorResponsavel(responsavel: string): Promise<PreCadastro[]> {
    const q = query(
      collection(db, this.collectionName),
      where('responsavel', '==', responsavel),
      orderBy('dataCadastro', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
    })) as PreCadastro[];
  }

  // Buscar pré-cadastros aguardando
  async buscarAguardando(): Promise<PreCadastro[]> {
    return this.buscarPorStatus('aguardando');
  }

  // Contar pré-cadastros por status
  async contarPorStatus(): Promise<{ aguardando: number; em_atendimento: number; finalizado: number }> {
    const [aguardando, emAtendimento, finalizado] = await Promise.all([
      this.buscarPorStatus('aguardando'),
      this.buscarPorStatus('em_atendimento'),
      this.buscarPorStatus('finalizado')
    ]);

    return {
      aguardando: aguardando.length,
      em_atendimento: emAtendimento.length,
      finalizado: finalizado.length
    };
  }
}

export const preCadastroService = new PreCadastroService();
