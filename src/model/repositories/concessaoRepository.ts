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
import { Concessao } from '@/model/entities';

export class ConcessaoRepository {
  private collectionName = 'concessoes';

  async getAll(maxDocs = 300): Promise<Concessao[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('data', 'desc'),
      limit(maxDocs)
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToConcessoes(querySnapshot.docs);
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
    
    const concessoes = this.mapDocsToConcessoes(snap.docs);
    const lastVisible = snap.docs[snap.docs.length - 1];
    return { concessoes, lastDoc: lastVisible };
  }

  async getByTipo(tipo: string): Promise<Concessao[]> {
    const q = query(
      collection(db, this.collectionName),
      where('tipo', '==', tipo),
      orderBy('data', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToConcessoes(querySnapshot.docs);
  }

  async getByPeriodo(inicio: Date, fim: Date, pageSize = 200): Promise<Concessao[]> {
    const q = query(
      collection(db, this.collectionName),
      where('data', '>=', Timestamp.fromDate(inicio)),
      where('data', '<=', Timestamp.fromDate(fim)),
      orderBy('data', 'desc'),
      limit(pageSize)
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToConcessoes(querySnapshot.docs);
  }

  async getById(id: string): Promise<Concessao | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        data: data.data instanceof Timestamp ? data.data.toDate() : new Date(data.data)
      } as Concessao;
    }
    return null;
  }

  async create(dados: Omit<Concessao, 'id'>): Promise<string> {
    const docData = {
      nome: dados.nome,
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

  async update(id: string, dados: Partial<Concessao>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updateData: any = { ...dados };
    
    if (dados.data) updateData.data = Timestamp.fromDate(new Date(dados.data));
    if (typeof dados.trafego === 'boolean' || dados.trafego === null) updateData.trafego = dados.trafego;
    
    delete updateData.id;

    await updateDoc(docRef, updateData);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  private mapDocsToConcessoes(docs: QueryDocumentSnapshot<DocumentData>[]): Concessao[] {
    return docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nome: data.nome || '',
        tipo: data.tipo || '',
        trafego: typeof data.trafego === 'boolean' ? data.trafego : null,
        responsavelUID: data.responsavelUID || '',
        responsavelNome: data.responsavelNome || '',
        cliente: data.cliente || '',
        data: data.data?.toDate() || new Date()
      } as Concessao;
    });
  }
}

export const concessaoRepository = new ConcessaoRepository();
