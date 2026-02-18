import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { FormularioColaborador } from '@/model/entities';

export class FormularioRepository {
  private collectionName = 'colaboradores';

  async save(userId: string, dados: FormularioColaborador): Promise<void> {
    // Preparar dados para salvar (remover campos undefined)
    const dadosParaSalvar: any = {
      ...dados,
      dataAtualizacao: new Date()
    };

    await setDoc(doc(db, this.collectionName, userId), dadosParaSalvar);
  }

  async getById(userId: string): Promise<FormularioColaborador | null> {
    const docRef = doc(db, this.collectionName, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as FormularioColaborador;
    }

    return null;
  }
}

export const formularioRepository = new FormularioRepository();
