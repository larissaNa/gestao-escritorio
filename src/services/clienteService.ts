import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, limit } from 'firebase/firestore';
import { db } from './firebase';
import { Cliente } from '@/types';

class ClienteService {
  private collectionName = 'clientes';

  async getAllClientes(): Promise<Cliente[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
      })) as Cliente[];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  async getClienteByCpf(cpf: string): Promise<Cliente | null> {
    try {
      const q = query(collection(db, this.collectionName), where('cpf', '==', cpf));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
      } as Cliente;
    } catch (error) {
      console.error('Erro ao buscar cliente por CPF:', error);
      throw error;
    }
  }

  async getClientesByPartialCpf(cpfPrefix: string): Promise<Cliente[]> {
    try {
      const q = query(
        collection(db, this.collectionName), 
        where('cpf', '>=', cpfPrefix),
        where('cpf', '<=', cpfPrefix + '\uf8ff'),
        orderBy('cpf'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
      })) as Cliente[];
    } catch (error) {
      console.error('Erro ao buscar clientes por CPF parcial:', error);
      throw error;
    }
  }

  async getClienteByNome(nome: string): Promise<Cliente[]> {
    try {
      const q = query(
        collection(db, this.collectionName), 
        where('nome', '>=', nome),
        where('nome', '<=', nome + '\uf8ff'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
      })) as Cliente[];
    } catch (error) {
      console.error('Erro ao buscar cliente por nome:', error);
      throw error;
    }
  }

  async createCliente(cliente: Omit<Cliente, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...cliente,
        dataCadastro: Timestamp.fromDate(cliente.dataCadastro)
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, cliente);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async deleteCliente(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }

  async getClientesAguardando(): Promise<Cliente[]> {
    try {
      // Buscar da coleção 'cadastrosRecepcao' como na estrutura antiga
      const q = query(
        collection(db, 'cadastrosRecepcao'),
        where('status', '==', 'esperando'),
        orderBy('dataCadastro', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const clientes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome || 'Nome não informado',
          cpf: '', // CPF não está na estrutura antiga
          telefone: data.telefone || '',
          email: '', // Email não está na estrutura antiga
          endereco: '', // Endereço não está na estrutura antiga
          dataCadastro: data.dataCadastro?.toDate() || new Date(),
          status: 'ativo' as const,
          advogadoResponsavel: data.responsavel || undefined
        };
      }) as Cliente[];
      
      return clientes;
    } catch (error) {
      console.error('Erro ao buscar clientes aguardando:', error);
      // Se não encontrar clientes com status 'esperando', tente buscar todos
      return await this.getAllClientes();
    }
  }

  async getClientesPorAdvogado(advogado: string): Promise<Cliente[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('advogadoResponsavel', '==', advogado),
        orderBy('dataCadastro', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
      })) as Cliente[];
    } catch (error) {
      console.error('Erro ao buscar clientes por advogado:', error);
      throw error;
    }
  }

  async getClientesPorAdvogados(advogados: string[]): Promise<Cliente[]> {
    try {
      if (advogados.length === 0) return [];
      
      const q = query(
        collection(db, this.collectionName),
        where('advogadoResponsavel', 'in', advogados),
        orderBy('dataCadastro', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
      })) as Cliente[];
    } catch (error) {
      console.error('Erro ao buscar clientes por advogados:', error);
      throw error;
    }
  }
}

export const clienteService = new ClienteService();
