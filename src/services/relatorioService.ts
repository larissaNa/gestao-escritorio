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
import { db } from './firebase';
import { RelatorioItem } from '@/types';

export class RelatorioService {
  private collectionName = 'relatorios';

  // Criar novo relatório
  async criarRelatorio(dados: Omit<RelatorioItem, 'id' | 'data' | 'mes'>): Promise<string> {
    const dataAtual = new Date();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...dados,
      data: Timestamp.now(),
      mes: dataAtual.getMonth() + 1
    });
    return docRef.id;
  }

  // Atualizar relatório
  async atualizarRelatorio(id: string, dados: Partial<RelatorioItem>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, dados);
  }

  // Excluir relatório
  async excluirRelatorio(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // Buscar todos os relatórios
  async buscarTodos(): Promise<RelatorioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data?.toDate() || new Date()
    })) as RelatorioItem[];
  }

  // Buscar relatórios por responsável
  async buscarPorResponsavel(responsavel: string): Promise<RelatorioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('responsavel', '==', responsavel),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data?.toDate() || new Date()
    })) as RelatorioItem[];
  }

  // Buscar relatórios por tipo de ação
  async buscarPorTipoAcao(tipoAcao: string): Promise<RelatorioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('tipo_acao', '==', tipoAcao),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data?.toDate() || new Date()
    })) as RelatorioItem[];
  }

  // Buscar relatórios por setor
  async buscarPorSetor(setor: string): Promise<RelatorioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('setor', '==', setor),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data?.toDate() || new Date()
    })) as RelatorioItem[];
  }

  // Buscar relatórios por mês
  async buscarPorMes(mes: number): Promise<RelatorioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('mes', '==', mes),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data?.toDate() || new Date()
    })) as RelatorioItem[];
  }

  // Buscar relatório por ID
  async buscarPorId(id: string): Promise<RelatorioItem | null> {
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

  // Obter estatísticas
  async obterEstatisticas(): Promise<{
    total: number;
    porSetor: Record<string, number>;
    porTipoAcao: Record<string, number>;
    porMes: Record<number, number>;
  }> {
    const relatorios = await this.buscarTodos();
    
    const porSetor: Record<string, number> = {};
    const porTipoAcao: Record<string, number> = {};
    const porMes: Record<number, number> = {};

    relatorios.forEach(relatorio => {
      // Contar por setor
      porSetor[relatorio.setor] = (porSetor[relatorio.setor] || 0) + 1;
      
      // Contar por tipo de ação
      porTipoAcao[relatorio.tipo_acao] = (porTipoAcao[relatorio.tipo_acao] || 0) + 1;
      
      // Contar por mês
      porMes[relatorio.mes] = (porMes[relatorio.mes] || 0) + 1;
    });

    return {
      total: relatorios.length,
      porSetor,
      porTipoAcao,
      porMes
    };
  }
}

export const relatorioService = new RelatorioService();
