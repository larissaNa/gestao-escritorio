import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/model/services/firebase';

export class UserRepository {
  private collectionName = 'users';

  async getById(uid: string): Promise<any> {
    try {
      const docRef = doc(db, this.collectionName, uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async save(uid: string, data: any): Promise<void> {
    try {
      await setDoc(doc(db, this.collectionName, uid), data);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
