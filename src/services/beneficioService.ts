import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, limit, startAfter, getCountFromServer, QueryDocumentSnapshot, DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { Beneficio } from '@/types';

class BeneficioService {
  private collectionName = 'beneficios';

  async getAllBeneficios(maxDocs = 300): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('data', 'desc'),
        limit(maxDocs)
      );
      const querySnapshot = await getDocs(q);
      
      const beneficios = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome || '',
          descricao: data.subtipo || '',
          tipo: data.tipo || '',
          responsavelUID: data.responsavelUID || '',
          responsavelNome: data.responsavelNome || '',
          cliente: data.cliente || '',
          ativo: true,
          dataCriacao: data.data?.toDate() || new Date()
        };
      });
      
      return beneficios;
    } catch (error) {
      console.error('Erro ao buscar benefícios:', error);
      throw error;
    }
  }

  async getBeneficiosPaginated(pageSize = 50, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    const constraints: QueryConstraint[] = [
      orderBy('data', 'desc'),
      limit(pageSize)
    ];
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    const q = query(collection(db, this.collectionName), ...constraints);
    const snap = await getDocs(q);

    const beneficios = snap.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        nome: data.nome || '',
        descricao: data.subtipo || '',
        tipo: data.tipo || '',
        responsavelUID: data.responsavelUID || '',
        responsavelNome: data.responsavelNome || '',
        cliente: data.cliente || '',
        ativo: true,
        dataCriacao: data.data?.toDate() || new Date()
      };
    });

    const lastVisible = snap.docs[snap.docs.length - 1];
    return { beneficios, lastDoc: lastVisible };
  }

  async getBeneficiosByTipo(tipo: string): Promise<Beneficio[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('tipo', '==', tipo),
        orderBy('data', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const beneficios = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome || '',
          descricao: data.subtipo || '',
          tipo: data.tipo || '',
          ativo: true,
          dataCriacao: data.data?.toDate() || new Date()
        };
      }) as Beneficio[];
      
      return beneficios;
    } catch (error) {
      console.error('Erro ao buscar benefícios por tipo:', error);
      throw error;
    }
  }

  async getBeneficiosByPeriodo(inicio: Date, fim: Date, pageSize = 200, lastDoc?: any): Promise<Beneficio[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('data', '>=', Timestamp.fromDate(inicio)),
        where('data', '<=', Timestamp.fromDate(fim)),
        orderBy('data', 'desc'),
        ...(lastDoc ? [startAfter(lastDoc)] : []),
        limit(pageSize)
      );
      const querySnapshot = await getDocs(q);
      
      const beneficios = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome || '',
          descricao: data.subtipo || '',
          tipo: data.tipo || '',
          ativo: true,
          dataCriacao: data.data?.toDate() || new Date()
        };
      }) as Beneficio[];
      
      return beneficios;
    } catch (error) {
      console.error('Erro ao buscar benefícios por período:', error);
      throw error;
    }
  }

  async createBeneficio(beneficio: any): Promise<string> {
    try {
      const docData: any = {
        nome: beneficio.nome,
        tipo: beneficio.tipo,
        responsavelUID: beneficio.responsavelUID,
        responsavelNome: beneficio.responsavelNome,
        cliente: beneficio.cliente,
        data: Timestamp.fromDate(beneficio.dataCriacao || beneficio.data)
      };

      // Only add subtipo if it has a value
      if (beneficio.subtipo && beneficio.subtipo.trim() !== '') {
        docData.subtipo = beneficio.subtipo;
      } else if (beneficio.descricao && beneficio.descricao.trim() !== '') {
        docData.subtipo = beneficio.descricao;
      }

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar benefício:', error);
      throw error;
    }
  }

  async updateBeneficio(id: string, beneficio: any): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData: any = {};
      
      if (beneficio.nome) updateData.nome = beneficio.nome;
      if (beneficio.tipo) updateData.tipo = beneficio.tipo;
      if (beneficio.responsavelUID) updateData.responsavelUID = beneficio.responsavelUID;
      if (beneficio.responsavelNome) updateData.responsavelNome = beneficio.responsavelNome;
      if (beneficio.cliente) updateData.cliente = beneficio.cliente;
      if (beneficio.dataCriacao || beneficio.data) updateData.data = Timestamp.fromDate(beneficio.dataCriacao || beneficio.data);
      
      // Handle subtipo properly - only add if it has a value
      if (beneficio.subtipo !== undefined) {
        if (beneficio.subtipo && beneficio.subtipo.trim() !== '') {
          updateData.subtipo = beneficio.subtipo;
        } else {
          // Remove the field if it's empty
          updateData.subtipo = null;
        }
      } else if (beneficio.descricao !== undefined) {
        if (beneficio.descricao && beneficio.descricao.trim() !== '') {
          updateData.subtipo = beneficio.descricao;
        } else {
          updateData.subtipo = null;
        }
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar benefício:', error);
      throw error;
    }
  }
  
  async deleteBeneficio(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar benefício:', error);
      throw error;
    }
  }

  async getBeneficiosCount(): Promise<number> {
    const snapshot = await getCountFromServer(collection(db, this.collectionName));
    return snapshot.data().count;
  }

  async getBeneficiosByYear(ano: number, pageSize = 200): Promise<Beneficio[]> {
    const inicio = new Date(ano, 0, 1);
    const fim = new Date(ano, 11, 31, 23, 59, 59);
    return this.getBeneficiosByPeriodo(inicio, fim, pageSize);
  }
}

export const beneficioService = new BeneficioService();
