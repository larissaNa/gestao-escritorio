import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, limit, startAfter, getCountFromServer, QueryDocumentSnapshot, DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { Atendimento } from '@/types';

class AtendimentoService {
  private collectionName = 'atendimentos';

  async getAllAtendimentos(maxDocs = 300): Promise<Atendimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('data_atendimento', 'desc'),
        limit(maxDocs)
      );
      const querySnapshot = await getDocs(q);
      
      const atendimentos = querySnapshot.docs.map(doc => {
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
          status: data.status || 'em_andamento' as const,
          modalidade: data.modalidade || 'Presencial'
        };
      }) as Atendimento[];
      
      return atendimentos;
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error);
      throw error;
    }
  }

  async getAtendimentosByCpf(cpf: string): Promise<Atendimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('cpf', '==', cpf),
        orderBy('data_atendimento', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
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
        };
      }) as Atendimento[];
    } catch (error) {
      console.error('Erro ao buscar atendimentos por CPF:', error);
      throw error;
    }
  }

  async getAtendimentosPaginated(pageSize = 50, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    const constraints: QueryConstraint[] = [
      orderBy('data_atendimento', 'desc'),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, this.collectionName), ...constraints);
    const snap = await getDocs(q);

    const itens = snap.docs.map((doc) => {
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
        status: data.status || 'em_andamento'
      } as Atendimento;
    });

    const lastVisible = snap.docs[snap.docs.length - 1];

    return { itens, lastDoc: lastVisible };
  }

  async getAtendimentosByCliente(clienteId: string): Promise<Atendimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('clienteId', '==', clienteId),
        orderBy('dataAtendimento', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataAtendimento: doc.data().dataAtendimento?.toDate() || new Date()
      })) as Atendimento[];
    } catch (error) {
      console.error('Erro ao buscar atendimentos por cliente:', error);
      throw error;
    }
  }

  async getAtendimentosByAdvogado(advogado: string): Promise<Atendimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('advogado_responsavel', '==', advogado),
        orderBy('data_atendimento', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
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
        };
      }) as Atendimento[];
    } catch (error) {
      console.error('Erro ao buscar atendimentos por advogado:', error);
      throw error;
    }
  }

  async getAtendimentosByAdvogados(advogados: string[]): Promise<Atendimento[]> {
    try {
      if (advogados.length === 0) return [];

      const q = query(
        collection(db, this.collectionName),
        where('advogado_responsavel', 'in', advogados),
        orderBy('data_atendimento', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
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
          status: data.status || 'em_andamento'
        };
      }) as Atendimento[];
    } catch (error) {
      console.error('Erro ao buscar atendimentos por advogados:', error);
      throw error;
    }
  }

  async getAtendimentosByResponsavel(responsavel: string): Promise<Atendimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('responsavel', '==', responsavel),
        orderBy('dataAtendimento', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataAtendimento: doc.data().dataAtendimento?.toDate() || new Date()
      })) as Atendimento[];
    } catch (error) {
      console.error('Erro ao buscar atendimentos por responsável:', error);
      throw error;
    }
  }

  async createAtendimento(atendimento: Omit<Atendimento, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        nome: atendimento.clienteNome,
        cpf: atendimento.clienteCpf,
        telefone: atendimento.clienteTelefone,
        tipo_procedimento: atendimento.tipoProcedimento,
        tipo_acao: atendimento.tipoAcao,
        responsavel: atendimento.responsavel,
        cidade: atendimento.cidade,
        observacoes: atendimento.observacoes || '',
        advogado_responsavel: atendimento.advogadoResponsavel || '',
        status: atendimento.status || 'em_andamento',
        modalidade: atendimento.modalidade || 'Presencial',
        data_atendimento: Timestamp.fromDate(atendimento.dataAtendimento)
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      throw error;
    }
  }

  async updateAtendimento(id: string, atendimento: Partial<Atendimento>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData: any = {};
      
      if (atendimento.clienteNome) updateData.nome = atendimento.clienteNome;
      if (atendimento.clienteCpf) updateData.cpf = atendimento.clienteCpf;
      if (atendimento.clienteTelefone) updateData.telefone = atendimento.clienteTelefone;
      if (atendimento.tipoProcedimento) updateData.tipo_procedimento = atendimento.tipoProcedimento;
      if (atendimento.tipoAcao) updateData.tipo_acao = atendimento.tipoAcao;
      if (atendimento.responsavel) updateData.responsavel = atendimento.responsavel;
      if (atendimento.cidade) updateData.cidade = atendimento.cidade;
      if (atendimento.observacoes !== undefined) updateData.observacoes = atendimento.observacoes;
      if (atendimento.advogadoResponsavel !== undefined) updateData.advogado_responsavel = atendimento.advogadoResponsavel;
      if (atendimento.status) updateData.status = atendimento.status;
      if (atendimento.modalidade) updateData.modalidade = atendimento.modalidade;
      if (atendimento.dataAtendimento) updateData.data_atendimento = Timestamp.fromDate(atendimento.dataAtendimento);
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error);
      throw error;
    }
  }

  async deleteAtendimento(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar atendimento:', error);
      throw error;
    }
  }

  async getAtendimentosByPeriodo(inicio: Date, fim: Date, pageSize = 200, lastDoc?: any): Promise<Atendimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('data_atendimento', '>=', Timestamp.fromDate(inicio)),
        where('data_atendimento', '<=', Timestamp.fromDate(fim)),
        orderBy('data_atendimento', 'desc'),
        ...(lastDoc ? [startAfter(lastDoc)] : []),
        limit(pageSize)
      );
      const querySnapshot = await getDocs(q);
      
      const atendimentos = querySnapshot.docs.map(doc => {
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
          status: data.status || 'em_andamento' as const,
          modalidade: data.modalidade || 'Presencial'
        };
      }) as Atendimento[];
      
      return atendimentos;
    } catch (error) {
      console.error('Erro ao buscar atendimentos por período:', error);
      // Se não encontrar atendimentos no período, tente buscar todos
      console.log('Tentando buscar todos os atendimentos...');
      return await this.getAllAtendimentos();
    }
  }

  async getAtendimentosCount(): Promise<number> {
    const snapshot = await getCountFromServer(collection(db, this.collectionName));
    return snapshot.data().count;
  }

  async getAtendimentosByYear(ano: number, pageSize = 500, hardLimit = 5000): Promise<Atendimento[]> {
    const inicio = new Date(ano, 0, 1);
    const fim = new Date(ano, 11, 31, 23, 59, 59);

    const resultados: Atendimento[] = [];
    let cursor: any | undefined;
    let fetched = 0;

    while (true) {
      const constraints: any[] = [
        where('data_atendimento', '>=', Timestamp.fromDate(inicio)),
        where('data_atendimento', '<=', Timestamp.fromDate(fim)),
        orderBy('data_atendimento', 'desc'),
        limit(pageSize)
      ];
      if (cursor) constraints.push(startAfter(cursor));

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      const page = querySnapshot.docs.map(doc => {
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
          status: data.status || 'em_andamento' as const,
          modalidade: data.modalidade || 'Presencial'
        };
      }) as Atendimento[];

      resultados.push(...page);
      fetched += page.length;

      if (page.length < pageSize || fetched >= hardLimit) break;
      cursor = querySnapshot.docs[querySnapshot.docs.length - 1];
    }

    return resultados;
  }

  async getAtendimentosByCidade(cidade: string): Promise<Atendimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('cidade', '==', cidade),
        orderBy('dataAtendimento', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataAtendimento: doc.data().dataAtendimento?.toDate() || new Date()
      })) as Atendimento[];
    } catch (error) {
      console.error('Erro ao buscar atendimentos por cidade:', error);
      throw error;
    }
  }
}

export const atendimentoService = new AtendimentoService();
