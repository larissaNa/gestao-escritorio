import { createDocSnapshot, createFirestoreDoc, createQuerySnapshot } from '../helpers/firestoreTestData';
import { describe, it, expect, vi, beforeEach } from "vitest";

const firestore = vi.hoisted(() => {
  class Timestamp {
    private _date: Date;
    constructor(date: Date) {
      this._date = date;
    }
    toDate() {
      return this._date;
    }
    static now = vi.fn(() => new Timestamp(new Date('2024-01-01T00:00:00.000Z')));
    static fromDate = vi.fn((d: Date) => new Timestamp(d));
  }

  return {
    Timestamp,
    QueryDocumentSnapshot: class {},
    DocumentData: class {},
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    limit: vi.fn(),
    orderBy: vi.fn(),
    query: vi.fn(),
    startAfter: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('@/model/services/firebase', () => ({ db: {} }));

describe('AtendimentoRepository', () => {
  beforeEach(() => {
    firestore.addDoc.mockReset();
    firestore.collection.mockReset();
    firestore.deleteDoc.mockReset();
    firestore.doc.mockReset();
    firestore.getDoc.mockReset();
    firestore.getDocs.mockReset();
    firestore.limit.mockReset();
    firestore.orderBy.mockReset();
    firestore.query.mockReset();
    firestore.startAfter.mockReset();
    firestore.updateDoc.mockReset();
    firestore.where.mockReset();
    firestore.Timestamp.fromDate.mockClear();
  });

  it('getAll: retorna lista vazia quando não há docs', async () => {
    const { AtendimentoRepository } = await import('@/model/repositories/atendimentoRepository');
    const repo = new AtendimentoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(data_atendimento)');
    firestore.limit.mockReturnValue('limit(300)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.getAll();

    expect(out).toEqual([]);
  });

  it('getAll: propaga erro quando getDocs falha', async () => {
    const { AtendimentoRepository } = await import('@/model/repositories/atendimentoRepository');
    const repo = new AtendimentoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(data_atendimento)');
    firestore.limit.mockReturnValue('limit(300)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockRejectedValue(new Error('boom'));

    await expect(repo.getAll()).rejects.toThrow('boom');
  });

  it('getCount: retorna snapshot.size', async () => {
    const { AtendimentoRepository } = await import('@/model/repositories/atendimentoRepository');
    const repo = new AtendimentoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.getDocs.mockResolvedValue({ size: 7 });

    const out = await repo.getCount();

    expect(out).toBe(7);
  });

  it('getPaginated: inclui startAfter quando lastDoc é fornecido', async () => {
    const { AtendimentoRepository } = await import('@/model/repositories/atendimentoRepository');
    const repo = new AtendimentoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(data_atendimento)');
    firestore.limit.mockReturnValue('limit(2)');
    firestore.startAfter.mockReturnValue('startAfter(last)');
    firestore.query.mockImplementation((_c: any, ...constraints: any[]) => ({ constraints }));
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([
        createFirestoreDoc('a1', { nome: 'N', cpf: '1', telefone: '2', data_atendimento: { toDate: () => new Date('2024-01-01') } }),
      ]),
    );

    const out = await repo.getPaginated(2, { last: true } as any);

    expect(firestore.startAfter).toHaveBeenCalledTimes(1);
    expect(out.itens).toHaveLength(1);
    expect(out.lastDoc).toBeDefined();
  });

  it('getById: mapeia campos alternativos e fechamento com datas', async () => {
    const { AtendimentoRepository } = await import('@/model/repositories/atendimentoRepository');
    const repo = new AtendimentoRepository();

    firestore.doc.mockReturnValue({ d: true });

    const concluidoEm = new firestore.Timestamp(new Date('2024-01-02'));
    const uploadedAt = new firestore.Timestamp(new Date('2024-01-03'));

    firestore.getDoc.mockResolvedValue(
      createDocSnapshot({
        id: 'id-1',
        data: {
          nome: 'Cliente',
          cpf: '123',
          telefone: '999',
          tipo_procedimento: 'Proc',
          tipo_acao: 'Ação',
          data_atendimento: new firestore.Timestamp(new Date('2024-01-01')),
          advogado_responsavel: 'Adv',
          fechamento: { concluidoEm, anexos: [{ uploadedAt }] },
        },
      }),
    );

    const out = await repo.getById('id-1');

    expect(out?.clienteNome).toBe('Cliente');
    expect(out?.tipoProcedimento).toBe('Proc');
    expect(out?.dataAtendimento).toEqual(new Date('2024-01-01'));
    expect(out?.fechamento?.concluidoEm).toEqual(new Date('2024-01-02'));
    expect(out?.fechamento?.anexos?.[0]?.uploadedAt).toEqual(new Date('2024-01-03'));
  });

  it('create: mapeia campos e remove undefined em profundidade', async () => {
    const { AtendimentoRepository } = await import('@/model/repositories/atendimentoRepository');
    const repo = new AtendimentoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.create({
      clienteNome: 'Nome',
      clienteCpf: '123',
      clienteTelefone: undefined,
      tipoProcedimento: 'P',
      tipoAcao: 'A',
      dataAtendimento: new Date('2024-01-01'),
      fechamento: { anexos: [{ name: 'x', uploadedAt: undefined }] },
    } as any);

    expect(id).toBe('new-id');
    expect(firestore.Timestamp.fromDate).toHaveBeenCalledWith(new Date('2024-01-01'));
    const payload = firestore.addDoc.mock.calls[0]?.[1] as Record<string, any>;
    expect(payload.nome).toBe('Nome');
    expect(payload).not.toHaveProperty('clienteTelefone');
    expect(payload.fechamento.anexos[0]).not.toHaveProperty('uploadedAt');
  });

  it('update: remove propriedades mapeadas e undefined antes de atualizar', async () => {
    const { AtendimentoRepository } = await import('@/model/repositories/atendimentoRepository');
    const repo = new AtendimentoRepository();

    const docRef = { d: true };
    firestore.doc.mockReturnValue(docRef);
    firestore.updateDoc.mockResolvedValue(undefined);

    await repo.update('id-1', {
      clienteNome: 'Nome',
      clienteCpf: undefined,
      dataAtendimento: new Date('2024-01-01'),
      modalidade: undefined,
    } as any);

    expect(firestore.updateDoc).toHaveBeenCalledTimes(1);
    const payload = firestore.updateDoc.mock.calls[0]?.[1] as Record<string, any>;
    expect(payload.nome).toBe('Nome');
    expect(payload).not.toHaveProperty('clienteNome');
    expect(payload).not.toHaveProperty('clienteCpf');
    expect(payload).not.toHaveProperty('modalidade');
    expect(payload).toHaveProperty('data_atendimento');
  });
});

