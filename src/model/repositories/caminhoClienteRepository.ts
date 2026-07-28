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
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import { CaminhoCliente, HistoricoEtapa } from '@/model/entities';

// Firestore rejeita `undefined`. Remove chaves com esse valor em objetos rasos.
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const clean: any = {};
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== undefined) clean[k] = obj[k];
  });
  return clean as T;
}

export class CaminhoClienteRepository {
  private collectionName = 'caminho_cliente';

  async list(pageSize = 500): Promise<CaminhoCliente[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('dataUltimaMovimentacao', 'desc'),
      limit(pageSize)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => this.mapDoc(d.id, d.data()));
  }

  async getById(id: string): Promise<CaminhoCliente | null> {
    const ref = doc(db, this.collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return this.mapDoc(snap.id, snap.data());
  }

  async create(payload: Omit<CaminhoCliente, 'id'>): Promise<string> {
    const dados = stripUndefined({
      ...payload,
      dataUltimaMovimentacao: Timestamp.fromDate(payload.dataUltimaMovimentacao),
      dataCadastro: Timestamp.fromDate(payload.dataCadastro),
      prazoProximaAcao: payload.prazoProximaAcao ? Timestamp.fromDate(payload.prazoProximaAcao) : null,
      historico: (payload.historico || []).map((h) =>
        stripUndefined({
          ...h,
          data: Timestamp.fromDate(h.data),
        })
      ),
    });
    const docRef = await addDoc(collection(db, this.collectionName), dados);
    return docRef.id;
  }

  async update(id: string, payload: Partial<CaminhoCliente>): Promise<void> {
    const ref = doc(db, this.collectionName, id);
    const updateData: any = { ...payload };

    if (payload.dataUltimaMovimentacao) {
      updateData.dataUltimaMovimentacao = Timestamp.fromDate(payload.dataUltimaMovimentacao);
    }
    if (payload.dataCadastro) {
      updateData.dataCadastro = Timestamp.fromDate(payload.dataCadastro);
    }
    if (payload.prazoProximaAcao !== undefined) {
      updateData.prazoProximaAcao = payload.prazoProximaAcao
        ? Timestamp.fromDate(payload.prazoProximaAcao)
        : null;
    }
    if (payload.historico) {
      updateData.historico = payload.historico.map((h) =>
        stripUndefined({
          ...h,
          data: h.data instanceof Date ? Timestamp.fromDate(h.data) : h.data,
        })
      );
    }

    await updateDoc(ref, stripUndefined(updateData));
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }

  private mapDoc(id: string, data: any): CaminhoCliente {
    const historico: HistoricoEtapa[] = Array.isArray(data.historico)
      ? data.historico.map((h: any) => ({
          etapa: h.etapa,
          responsavel: h.responsavel,
          responsavelUid: h.responsavelUid,
          observacao: h.observacao,
          data: h.data?.toDate ? h.data.toDate() : new Date(h.data),
        }))
      : [];

    return {
      id,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      clienteCpf: data.clienteCpf,
      tipoBeneficio: data.tipoBeneficio,
      numeroProcessoAdm: data.numeroProcessoAdm,
      numeroProcessoJud: data.numeroProcessoJud,
      etapaAtual: data.etapaAtual,
      situacao: data.situacao,
      setorResponsavel: data.setorResponsavel,
      responsavelAtual: data.responsavelAtual,
      proximaAcao: data.proximaAcao,
      prazoProximaAcao: data.prazoProximaAcao?.toDate
        ? data.prazoProximaAcao.toDate()
        : data.prazoProximaAcao
        ? new Date(data.prazoProximaAcao)
        : null,
      observacoes: data.observacoes,
      historico,
      dataUltimaMovimentacao: data.dataUltimaMovimentacao?.toDate
        ? data.dataUltimaMovimentacao.toDate()
        : new Date(data.dataUltimaMovimentacao),
      dataCadastro: data.dataCadastro?.toDate
        ? data.dataCadastro.toDate()
        : new Date(data.dataCadastro),
      ativo: data.ativo ?? true,
    };
  }
}

export const caminhoClienteRepository = new CaminhoClienteRepository();
