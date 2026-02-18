import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  limit 
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { Cliente } from '@/model/entities';

export class ClienteRepository {
  private collectionName = 'clientes';

  async getAll(): Promise<Cliente[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return this.mapDocsToClientes(querySnapshot.docs);
  }

  async getAllOrderedByName(maxDocs = 50): Promise<Cliente[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('nome'),
      limit(maxDocs)
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToClientes(querySnapshot.docs);
  }

  async getByCpf(cpf: string): Promise<Cliente | null> {
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
  }

  async getByPartialCpf(cpfPrefix: string): Promise<Cliente[]> {
    const q = query(
      collection(db, this.collectionName), 
      where('cpf', '>=', cpfPrefix),
      where('cpf', '<=', cpfPrefix + '\uf8ff'),
      orderBy('cpf'),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToClientes(querySnapshot.docs);
  }

  async getByNome(nome: string, limitVal = 20): Promise<Cliente[]> {
    const q = query(
      collection(db, this.collectionName), 
      where('nome', '>=', nome),
      where('nome', '<=', nome + '\uf8ff'),
      limit(limitVal)
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToClientes(querySnapshot.docs);
  }

  async getById(id: string): Promise<Cliente | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        dataCadastro: docSnap.data().dataCadastro?.toDate() || new Date()
      } as Cliente;
    } else {
      return null;
    }
  }

  async create(cliente: Omit<Cliente, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...cliente,
      dataCadastro: Timestamp.fromDate(cliente.dataCadastro)
    });
    return docRef.id;
  }

  async update(id: string, cliente: Partial<Cliente>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updateData: any = { ...cliente };
    if (cliente.dataCadastro) {
      updateData.dataCadastro = Timestamp.fromDate(cliente.dataCadastro);
    }
    await updateDoc(docRef, updateData);
  }

  private mapDocsToClientes(docs: any[]): Cliente[] {
    return docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dataCadastro: doc.data().dataCadastro?.toDate() || new Date()
    })) as Cliente[];
  }
}

export const clienteRepository = new ClienteRepository();
