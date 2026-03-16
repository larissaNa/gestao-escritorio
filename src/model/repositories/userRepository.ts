import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/model/services/firebase';

export class UserRepository {
  private collectionName = 'users';

  async getById(uid?: string): Promise<Record<string, unknown> | null> {
    try {
      if (!uid) return null;
      const docRef = doc(db, this.collectionName, uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Record<string, unknown>;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async save(uid: string, data: Record<string, unknown | undefined>): Promise<void> {
    try {
      const sanitized = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined),
      ) as Record<string, unknown>;
      await setDoc(doc(db, this.collectionName, uid), sanitized);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw error;
    }
  }

  async update(uid: string, data: Record<string, unknown | undefined>): Promise<void> {
    try {
      const sanitized = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined),
      ) as Record<string, unknown>;
      await setDoc(doc(db, this.collectionName, uid), sanitized, { merge: true });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
