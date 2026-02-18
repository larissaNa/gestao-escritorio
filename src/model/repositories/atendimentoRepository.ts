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
import { Atendimento } from '@/model/entities';

export class AtendimentoRepository {
  private collectionName = 'atendimentos';

  async getAll(maxDocs = 300): Promise<Atendimento[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('data_atendimento', 'desc'),
      limit(maxDocs)
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToAtendimentos(querySnapshot.docs);
  }

  async getByCpf(cpf: string): Promise<Atendimento[]> {
    const q = query(
      collection(db, this.collectionName),
      where('cpf', '==', cpf),
      orderBy('data_atendimento', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToAtendimentos(querySnapshot.docs);
  }

  async getPaginated(pageSize = 50, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    const constraints: QueryConstraint[] = [
      orderBy('data_atendimento', 'desc'),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, this.collectionName), ...constraints);
    const snap = await getDocs(q);
    const itens = this.mapDocsToAtendimentos(snap.docs);
    const lastVisible = snap.docs[snap.docs.length - 1];
    
    return { itens, lastDoc: lastVisible };
  }

  async getById(id: string): Promise<Atendimento | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        clienteId: data.clienteId || '',
        clienteNome: data.nome || data.clienteNome,
        clienteCpf: data.cpf || data.clienteCpf,
        clienteTelefone: data.telefone || data.clienteTelefone,
        tipoProcedimento: data.tipo_procedimento || data.tipoProcedimento,
        tipoAcao: data.tipo_acao || data.tipoAcao,
        responsavel: data.responsavel,
        cidade: data.cidade,
        dataAtendimento: data.data_atendimento?.toDate() || new Date(),
        observacoes: data.observacoes,
        advogadoResponsavel: data.advogado_responsavel || data.advogadoResponsavel,
        modalidade: data.modalidade,
        status: data.status
      } as Atendimento;
    }
    return null;
  }

  async getByPeriodo(inicio: Date, fim: Date): Promise<Atendimento[]> {
    const q = query(
      collection(db, this.collectionName),
      where('data_atendimento', '>=', Timestamp.fromDate(inicio)),
      where('data_atendimento', '<=', Timestamp.fromDate(fim)),
      orderBy('data_atendimento', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToAtendimentos(querySnapshot.docs);
  }

  async getCount(): Promise<number> {
    const coll = collection(db, this.collectionName);
    const snapshot = await getDocs(coll);
    return snapshot.size;
  }

  async create(data: Omit<Atendimento, 'id'>): Promise<string> {
    // Converter datas para Timestamp se necessário, ou deixar o Firestore lidar se for Date
    const docData = {
      ...data,
      nome: data.clienteNome,
      cpf: data.clienteCpf,
      telefone: data.clienteTelefone,
      tipo_procedimento: data.tipoProcedimento,
      tipo_acao: data.tipoAcao,
      advogado_responsavel: data.advogadoResponsavel,
      data_atendimento: Timestamp.fromDate(data.dataAtendimento)
    };
    
    // Remover campos undefined para não dar erro no Firestore
    Object.keys(docData).forEach(key => docData[key as keyof typeof docData] === undefined && delete docData[key as keyof typeof docData]);

    const docRef = await addDoc(collection(db, this.collectionName), docData);
    return docRef.id;
  }

  async update(id: string, data: Partial<Atendimento>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updateData: any = { ...data };
    
    // Mapeamento inverso
    if (data.clienteNome) updateData.nome = data.clienteNome;
    if (data.clienteCpf) updateData.cpf = data.clienteCpf;
    if (data.clienteTelefone) updateData.telefone = data.clienteTelefone;
    if (data.tipoProcedimento) updateData.tipo_procedimento = data.tipoProcedimento;
    if (data.tipoAcao) updateData.tipo_acao = data.tipoAcao;
    if (data.advogadoResponsavel) updateData.advogado_responsavel = data.advogadoResponsavel;
    if (data.dataAtendimento) updateData.data_atendimento = Timestamp.fromDate(data.dataAtendimento);

    // Remover campos mapeados que não devem ir com o nome original da entidade se diferem do banco
    delete updateData.clienteNome;
    delete updateData.clienteCpf;
    delete updateData.clienteTelefone;
    delete updateData.tipoProcedimento;
    delete updateData.tipoAcao;
    delete updateData.advogadoResponsavel;
    delete updateData.dataAtendimento;

    await updateDoc(docRef, updateData);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  private mapDocsToAtendimentos(docs: QueryDocumentSnapshot<DocumentData>[]): Atendimento[] {
    return docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        clienteId: doc.id,
        clienteNome: data.nome || '',
        clienteCpf: data.cpf || '',
        clienteTelefone: data.telefone || '',
        tipoProcedimento: data.tipo_procedimento || '',
        tipoAcao: data.tipo_acao || '',
        responsavel: data.responsavel || '',
        cidade: data.cidade || '',
        dataAtendimento: data.data_atendimento?.toDate() || new Date(),
        observacoes: data.observacoes || '',
        advogadoResponsavel: data.advogado_responsavel || undefined,
        status: data.status || 'em_andamento',
        modalidade: data.modalidade || 'Presencial'
      } as Atendimento;
    });
  }
}

export const atendimentoRepository = new AtendimentoRepository();
