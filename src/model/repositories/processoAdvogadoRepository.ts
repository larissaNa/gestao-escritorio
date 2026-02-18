import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { ProcessoAdvogado } from '@/model/entities';

export class ProcessoAdvogadoRepository {
  private collectionName = 'processos_advogados';

  async list(userUid: string, isAdmin: boolean, pageSize = 200): Promise<ProcessoAdvogado[]> {
    const baseQuery = isAdmin
      ? query(collection(db, this.collectionName), orderBy('dataUltimaAtualizacao', 'desc'), limit(pageSize))
      : query(
          collection(db, this.collectionName),
          where('uidAdvogado', '==', userUid),
          orderBy('dataUltimaAtualizacao', 'desc'),
          limit(pageSize)
        );

    const snapshot = await getDocs(baseQuery);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        dataUltimaAtualizacao: data.dataUltimaAtualizacao?.toDate
          ? data.dataUltimaAtualizacao.toDate()
          : new Date(data.dataUltimaAtualizacao)
      } as ProcessoAdvogado;
    });
  }

  async getById(id: string): Promise<ProcessoAdvogado | null> {
    const ref = doc(db, this.collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      dataUltimaAtualizacao: data.dataUltimaAtualizacao?.toDate
        ? data.dataUltimaAtualizacao.toDate()
        : new Date(data.dataUltimaAtualizacao)
    } as ProcessoAdvogado;
  }

  async create(payload: Omit<ProcessoAdvogado, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...payload,
      dataUltimaAtualizacao: Timestamp.fromDate(payload.dataUltimaAtualizacao || new Date())
    });
    return docRef.id;
  }

  async update(id: string, payload: Partial<ProcessoAdvogado>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updateData: any = { ...payload };

    if (payload.dataUltimaAtualizacao) {
      updateData.dataUltimaAtualizacao = Timestamp.fromDate(payload.dataUltimaAtualizacao);
    }

    await updateDoc(docRef, updateData);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}

export const processoAdvogadoRepository = new ProcessoAdvogadoRepository();
