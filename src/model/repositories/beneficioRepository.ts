import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  QueryDocumentSnapshot, 
  DocumentData, 
  QueryConstraint,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';

// Ajuste para usar o tipo correto se Beneficio não for o exportado
import { BeneficioItem } from '@/model/entities'; 

export class BeneficioRepository {
  private collectionName = 'beneficios';

  async getAll(maxDocs = 300): Promise<any[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('data', 'desc'),
      limit(maxDocs)
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToBeneficios(querySnapshot.docs);
  }

  async getPaginated(pageSize = 50, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    const constraints: QueryConstraint[] = [
      orderBy('data', 'desc'),
      limit(pageSize)
    ];
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    const q = query(collection(db, this.collectionName), ...constraints);
    const snap = await getDocs(q);
    
    const beneficios = this.mapDocsToBeneficios(snap.docs);
    const lastVisible = snap.docs[snap.docs.length - 1];
    return { beneficios, lastDoc: lastVisible };
  }

  async getByTipo(tipo: string): Promise<BeneficioItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('tipo', '==', tipo),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToBeneficios(querySnapshot.docs);
  }

  async getByPeriodo(inicio: Date, fim: Date, pageSize = 200): Promise<BeneficioItem[]> {
    // Firestore range queries on dates
    const q = query(
      collection(db, this.collectionName),
      where('data', '>=', Timestamp.fromDate(inicio)),
      where('data', '<=', Timestamp.fromDate(fim)),
      orderBy('data', 'desc'),
      limit(pageSize)
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToBeneficios(querySnapshot.docs);
  }

  async getById(id: string): Promise<BeneficioItem | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        data: data.data instanceof Timestamp ? data.data.toDate() : new Date(data.data)
      } as BeneficioItem;
    }
    return null;
  }

  async create(dados: Omit<BeneficioItem, 'id' | 'ativo' | 'dataCriacao'>): Promise<string> {
    const docData = {
      nome: dados.nome,
      subtipo: dados.subtipo || '', // Adaptar conforme a entidade
      tipo: dados.tipo,
      trafego: dados.trafego ?? null,
      responsavelUID: dados.responsavelUID,
      responsavelNome: dados.responsavelNome,
      cliente: dados.cliente,
      data: dados.data ? Timestamp.fromDate(new Date(dados.data)) : Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, this.collectionName), docData);
    return docRef.id;
  }

  async update(id: string, dados: Partial<BeneficioItem>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updateData: any = { ...dados };
    
    if (dados.subtipo) updateData.subtipo = dados.subtipo;
    if (dados.data) updateData.data = Timestamp.fromDate(new Date(dados.data));
    if (typeof dados.trafego === 'boolean' || dados.trafego === null) updateData.trafego = dados.trafego;
    
    // Limpeza de campos virtuais se houver
    delete updateData.id;
    delete updateData.ativo;
    delete updateData.dataCriacao;
    delete updateData.descricao; // se o banco usa subtipo

    await updateDoc(docRef, updateData);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  private mapDocsToBeneficios(docs: QueryDocumentSnapshot<DocumentData>[]): any[] {
    return docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nome: data.nome || '',
        descricao: data.subtipo || '',
        subtipo: data.subtipo || '',
        tipo: data.tipo || '',
        trafego: typeof data.trafego === 'boolean' ? data.trafego : null,
        responsavelUID: data.responsavelUID || '',
        responsavelNome: data.responsavelNome || '',
        cliente: data.cliente || '',
        ativo: true,
        dataCriacao: data.data?.toDate() || new Date(),
        data: data.data?.toDate() || new Date()
      };
    });
  }
}

export const beneficioRepository = new BeneficioRepository();
