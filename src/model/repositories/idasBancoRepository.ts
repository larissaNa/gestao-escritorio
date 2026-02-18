import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  deleteDoc,
  updateDoc, 
  query, 
  orderBy, 
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { IdaBanco } from '@/model/entities';

export class IdaBancoRepository {
  private collectionName = 'idas_banco';

  async add(ida: Omit<IdaBanco, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...ida,
      createdAt: Timestamp.now(),
      dataIda: Timestamp.fromDate(ida.dataIda)
    });
    return docRef.id;
  }

  async getAll(): Promise<IdaBanco[]> {
    const q = query(collection(db, this.collectionName), orderBy('dataIda', 'desc'));
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
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      } as IdaBanco;
    });
  }

  async getById(id: string): Promise<IdaBanco | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        clienteNome: data.clienteNome,
        responsavelId: data.responsavelId,
        responsavelNome: data.responsavelNome,
        dataIda: data.dataIda.toDate(),
        banco: data.banco,
        numeroIda: data.numeroIda,
        observacoes: data.observacoes,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      } as IdaBanco;
    } else {
      return null;
    }
  }

  async countByCliente(clienteNome: string): Promise<number> {
    const q = query(
      collection(db, this.collectionName), 
      where('clienteNome', '==', clienteNome)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }

  async update(id: string, ida: Partial<IdaBanco>): Promise<void> {
    const dataToUpdate: any = { ...ida };
    if (ida.dataIda) {
      dataToUpdate.dataIda = Timestamp.fromDate(ida.dataIda);
    }
    // Remove campos que não devem ser atualizados diretamente ou são undefined
    delete dataToUpdate.id;
    delete dataToUpdate.createdAt;
    
    await updateDoc(doc(db, this.collectionName, id), dataToUpdate);
  }
}

export const idasBancoRepository = new IdaBancoRepository();
