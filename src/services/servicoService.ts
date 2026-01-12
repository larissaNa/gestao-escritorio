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
import { db } from './firebase';
import { ServicoItem } from '@/types';

export class ServicoService {
  private collectionName = 'servicos';

  // Criar novo serviço
  async criarServico(dados: Omit<ServicoItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), dados);
    return docRef.id;
  }

  // Atualizar serviço
  async atualizarServico(id: string, dados: Partial<ServicoItem>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, dados);
  }

  // Excluir serviço
  async excluirServico(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // Buscar todos os serviços
  async buscarTodos(): Promise<ServicoItem[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('area', 'asc'),
      orderBy('tipoAcao', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServicoItem[];
  }

  // Buscar serviços por área
  async buscarPorArea(area: string): Promise<ServicoItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('area', '==', area),
      orderBy('tipoAcao', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServicoItem[];
  }

  // Buscar serviços por advogado responsável
  async buscarPorAdvogado(advogado: string): Promise<ServicoItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('advogadoResponsavel', '==', advogado),
      orderBy('area', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServicoItem[];
  }

  // Buscar serviço por ID
  async buscarPorId(id: string): Promise<ServicoItem | null> {
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

  // Obter áreas únicas
  async obterAreas(): Promise<string[]> {
    const servicos = await this.buscarTodos();
    return [...new Set(servicos.map(s => s.area))].sort();
  }

  // Obter advogados únicos
  async obterAdvogados(): Promise<string[]> {
    const servicos = await this.buscarTodos();
    return [...new Set(servicos.map(s => s.advogadoResponsavel))].sort();
  }

  // Obter estatísticas
  async obterEstatisticas(): Promise<{
    total: number;
    porArea: Record<string, number>;
    porAdvogado: Record<string, number>;
  }> {
    const servicos = await this.buscarTodos();
    
    const porArea: Record<string, number> = {};
    const porAdvogado: Record<string, number> = {};

    servicos.forEach(servico => {
      // Contar por área
      porArea[servico.area] = (porArea[servico.area] || 0) + 1;
      
      // Contar por advogado
      porAdvogado[servico.advogadoResponsavel] = (porAdvogado[servico.advogadoResponsavel] || 0) + 1;
    });

    return {
      total: servicos.length,
      porArea,
      porAdvogado
    };
  }
}

export const servicoService = new ServicoService();
