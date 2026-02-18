import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { FormularioColaborador } from '@/model/entities';

// Interface que pode precisar estar em entities se for usada amplamente
export interface ColaboradorData extends FormularioColaborador {
  id?: string;
  role?: 'admin' | 'advogado' | 'recepcao';
  email?: string;
}

export class ColaboradorRepository {
  private collectionName = 'colaboradores';

  async getById(id: string): Promise<ColaboradorData | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ColaboradorData;
    }

    return null;
  }

  async getAll(): Promise<ColaboradorData[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ColaboradorData[];
  }

  async getByRole(role: string): Promise<ColaboradorData[]> {
    const q = query(
      collection(db, this.collectionName),
      where('role', '==', role)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ColaboradorData[];
  }
}

export const colaboradorRepository = new ColaboradorRepository();
