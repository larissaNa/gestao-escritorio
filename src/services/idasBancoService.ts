import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc,
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { IdaBanco } from '../types';

const COLLECTION_NAME = 'idas_banco';

export const idasBancoService = {
  // Adicionar nova ida ao banco
  addIda: async (ida: Omit<IdaBanco, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...ida,
        createdAt: Timestamp.now(),
        dataIda: Timestamp.fromDate(ida.dataIda)
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar ida ao banco:', error);
      throw error;
    }
  },

  // Buscar todas as idas
  getIdas: async (): Promise<IdaBanco[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('dataIda', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          clienteNome: data.clienteNome,
          responsavelId: data.responsavelId,
          responsavelNome: data.responsavelNome,
          dataIda: data.dataIda.toDate(),
          banco: data.banco,
          numeroIda: data.numeroIda,
          observacoes: data.observacoes,
          createdAt: data.createdAt.toDate()
        } as IdaBanco;
      });
    } catch (error) {
      console.error('Erro ao buscar idas ao banco:', error);
      throw error;
    }
  },

  // Contar idas de um cliente específico
  countIdasCliente: async (clienteNome: string): Promise<number> => {
    try {
      // Normaliza o nome para busca (opcional, mas recomendado se possível)
      // Aqui faremos uma busca exata por simplicidade, mas o ideal seria normalizar
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('clienteNome', '==', clienteNome)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Erro ao contar idas do cliente:', error);
      return 0;
    }
  },

  // Excluir uma ida
  deleteIda: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Erro ao excluir ida ao banco:', error);
      throw error;
    }
  },

  // Atualizar uma ida
  updateIda: async (id: string, ida: Partial<IdaBanco>): Promise<void> => {
    try {
      const dataToUpdate: any = { ...ida };
      if (ida.dataIda) {
        dataToUpdate.dataIda = Timestamp.fromDate(ida.dataIda);
      }
      // Remove campos que não devem ser atualizados diretamente ou são undefined
      delete dataToUpdate.id;
      delete dataToUpdate.createdAt;
      
      await updateDoc(doc(db, COLLECTION_NAME, id), dataToUpdate);
    } catch (error) {
      console.error('Erro ao atualizar ida ao banco:', error);
      throw error;
    }
  }
};
