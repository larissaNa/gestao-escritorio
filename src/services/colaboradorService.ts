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
import { db } from './firebase';
import { FormularioColaborador } from '@/types';

export interface ColaboradorData extends FormularioColaborador {
  id?: string;
  role?: 'admin' | 'advogado' | 'recepcao';
  email?: string;
}

export class ColaboradorService {
  private collectionName = 'colaboradores';

  // Buscar colaborador por ID do usuário
  async getColaboradorByUserId(userId: string): Promise<ColaboradorData | null> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ColaboradorData;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      throw error;
    }
  }

  // Buscar todos os colaboradores (apenas para admins)
  async getAllColaboradores(): Promise<ColaboradorData[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ColaboradorData[];
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      throw error;
    }
  }

  // Buscar colaboradores por role
  async getColaboradoresByRole(role: string): Promise<ColaboradorData[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('role', '==', role)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ColaboradorData[];
    } catch (error) {
      console.error('Erro ao buscar colaboradores por role:', error);
      throw error;
    }
  }

  // Verificar se colaborador preencheu o formulário
  async hasFilledForm(userId: string): Promise<boolean> {
    try {
      const colaborador = await this.getColaboradorByUserId(userId);
      if (!colaborador) return false;

      // Verificar se os campos obrigatórios estão preenchidos
      const camposObrigatorios = [
        'primeiroNome',
        'sobreNome',
        'cpf',
        'funcaoCargo',
        'departamento'
      ];

      return camposObrigatorios.every(campo => 
        colaborador[campo as keyof ColaboradorData] && 
        String(colaborador[campo as keyof ColaboradorData]).trim() !== ''
      );
    } catch (error) {
      console.error('Erro ao verificar formulário:', error);
      return false;
    }
  }

  // Obter nome completo do colaborador
  async getNomeCompleto(userId: string): Promise<string> {
    try {
      const colaborador = await this.getColaboradorByUserId(userId);
      if (colaborador && colaborador.primeiroNome) {
        return `${colaborador.primeiroNome} ${colaborador.sobreNome || ''}`.trim();
      }
      return '';
    } catch (error) {
      console.error('Erro ao obter nome:', error);
      return '';
    }
  }

  // Verificar se é admin
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const colaborador = await this.getColaboradorByUserId(userId);
      return colaborador?.role === 'admin';
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      return false;
    }
  }

  // Atualizar dados do colaborador
  async updateColaborador(userId: string, data: Partial<ColaboradorData>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      throw error;
    }
  }

  // Excluir colaborador e todos os seus dados
  async deleteColaborador(uid: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // 1. Buscar e deletar registros de ponto (subcoleção)
      // Nota: Batch tem limite de 500 operações. Se tiver muitos pontos, pode precisar de loop.
      // Assumindo volume razoável para este contexto.
      const registrosRef = collection(db, 'usuarios', uid, 'registros');
      const registrosSnap = await getDocs(registrosRef);
      
      registrosSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // 2. Deletar documento de usuário na coleção 'usuarios' (usada pelo PontoService)
      const usuarioPontoRef = doc(db, 'usuarios', uid);
      batch.delete(usuarioPontoRef);

      // 3. Deletar dados do formulário/colaborador
      const colaboradorRef = doc(db, 'colaboradores', uid);
      batch.delete(colaboradorRef);

      // 4. Deletar dados de usuário (auth metadata)
      const userRef = doc(db, 'users', uid);
      batch.delete(userRef);

      await batch.commit();
      
      console.log(`Usuário ${uid} e seus dados foram excluídos com sucesso.`);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error('Falha ao excluir dados do usuário. O registro de autenticação pode persistir.');
    }
  }
}

export const colaboradorService = new ColaboradorService();
