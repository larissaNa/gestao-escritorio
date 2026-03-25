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
import type { Atendimento, AtendimentoStatus } from '@/model/entities';

export class AtendimentoRepository {
  private collectionName = 'atendimentos';

  private cleanUndefinedDeep(value: unknown): unknown {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value;

    if (Array.isArray(value)) {
      return value
        .map((item) => this.cleanUndefinedDeep(item))
        .filter((item) => item !== undefined);
    }

    if (typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        const cleaned = this.cleanUndefinedDeep(val);
        if (cleaned !== undefined) out[key] = cleaned;
      }
      return out;
    }

    return value;
  }

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

  async getByStatus(status: AtendimentoStatus, maxDocs = 500): Promise<Atendimento[]> {
    const q = query(
      collection(db, this.collectionName),
      where('status', '==', status),
      orderBy('data_atendimento', 'desc'),
      limit(maxDocs)
    );
    const querySnapshot = await getDocs(q);
    return this.mapDocsToAtendimentos(querySnapshot.docs);
  }

  async getCountByStatus(status: AtendimentoStatus): Promise<number> {
    const q = query(
      collection(db, this.collectionName),
      where('status', '==', status)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
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
        dataAtendimento: this.getDataAtendimento(data),
        observacoes: data.observacoes,
        advogadoResponsavel: data.advogado_responsavel || data.advogadoResponsavel,
        modalidade: data.modalidade,
        status: data.status,
        fechamento: this.mapFechamento(data.fechamento)
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

  async getCountByPeriodo(inicio: Date, fim: Date): Promise<number> {
    const q = query(
      collection(db, this.collectionName),
      where('data_atendimento', '>=', Timestamp.fromDate(inicio)),
      where('data_atendimento', '<=', Timestamp.fromDate(fim)),
      orderBy('data_atendimento', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  async getCount(): Promise<number> {
    const coll = collection(db, this.collectionName);
    const snapshot = await getDocs(coll);
    return snapshot.size;
  }

  async getSemDataAtendimento(maxDocs = 2000): Promise<Array<{ id: string } & Record<string, unknown>>> {
    const q = query(
      collection(db, this.collectionName),
      where('data_atendimento', '==', null),
      limit(maxDocs)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return { id: d.id, ...data, data_atendimento: data.data_atendimento ?? null };
    });
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
      data_atendimento: Timestamp.fromDate(data.dataAtendimento),
      fechamento: data.fechamento
    };
    
    const cleanedDocData = this.cleanUndefinedDeep(docData) as typeof docData;

    const docRef = await addDoc(collection(db, this.collectionName), cleanedDocData);
    return docRef.id;
  }

  async update(id: string, data: Partial<Atendimento>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updateData: Record<string, unknown> = { ...data } as Record<string, unknown>;
    
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

    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);
    const cleanedUpdateData = this.cleanUndefinedDeep(updateData) as typeof updateData;

    await updateDoc(docRef, cleanedUpdateData);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  private parseFirestoreDate(raw: unknown): Date | null {
    if (!raw) return null;
    if (raw instanceof Date) return Number.isFinite(raw.getTime()) ? raw : null;

    if (typeof raw === 'string' || typeof raw === 'number') {
      const d = new Date(raw);
      return Number.isFinite(d.getTime()) ? d : null;
    }

    if (typeof raw === 'object') {
      const maybeToDate = (raw as { toDate?: unknown }).toDate;
      if (typeof maybeToDate === 'function') {
        const d = (raw as { toDate: () => Date }).toDate();
        return d instanceof Date && Number.isFinite(d.getTime()) ? d : null;
      }
    }

    return null;
  }

  private getDataAtendimento(data: DocumentData): Date {
    const raw = data.data_atendimento ?? data.dataAtendimento;
    return this.parseFirestoreDate(raw) ?? new Date(0);
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
        dataAtendimento: this.getDataAtendimento(data),
        observacoes: data.observacoes || '',
        advogadoResponsavel: data.advogado_responsavel || undefined,
        status: data.status || 'em_andamento',
        modalidade: data.modalidade || 'Presencial',
        fechamento: this.mapFechamento(data.fechamento)
      } as Atendimento;
    });
  }

  private mapFechamento(raw: unknown): Atendimento['fechamento'] | undefined {
    if (!raw || typeof raw !== 'object') return undefined;

    const rawObj = raw as Record<string, unknown>;
    const anexos = Array.isArray(rawObj.anexos) ? rawObj.anexos : [];

    const concluidoEmRaw = rawObj.concluidoEm;
    const concluidoEm =
      typeof concluidoEmRaw === 'object' &&
      concluidoEmRaw !== null &&
      'toDate' in (concluidoEmRaw as Record<string, unknown>) &&
      typeof (concluidoEmRaw as { toDate?: unknown }).toDate === 'function'
        ? (concluidoEmRaw as { toDate: () => Date }).toDate()
        : concluidoEmRaw;

    const mappedAnexos = anexos.map((a) => {
      const aObj = a && typeof a === 'object' ? (a as Record<string, unknown>) : {};
      const uploadedAtRaw = aObj.uploadedAt;
      const uploadedAt =
        typeof uploadedAtRaw === 'object' &&
        uploadedAtRaw !== null &&
        'toDate' in (uploadedAtRaw as Record<string, unknown>) &&
        typeof (uploadedAtRaw as { toDate?: unknown }).toDate === 'function'
          ? (uploadedAtRaw as { toDate: () => Date }).toDate()
          : uploadedAtRaw;

      return {
        ...aObj,
        uploadedAt,
      };
    });

    return {
      ...rawObj,
      concluidoEm,
      anexos: mappedAnexos,
    } as Atendimento['fechamento'];
  }
}

export const atendimentoRepository = new AtendimentoRepository();
