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

describe('BeneficioRepository', () => {
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
    firestore.Timestamp.now.mockClear();
    firestore.Timestamp.fromDate.mockClear();
  });

  it('getById: retorna null quando documento não existe', async () => {
    const { BeneficioRepository } = await import('@/model/repositories/beneficioRepository');
    const repo = new BeneficioRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 'b1', data: null }));

    const out = await repo.getById('b1');

    expect(out).toBeNull();
  });

  it('getById: converte Timestamp em Date', async () => {
    const { BeneficioRepository } = await import('@/model/repositories/beneficioRepository');
    const repo = new BeneficioRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(
      createDocSnapshot({
        id: 'b1',
        data: { nome: 'N', data: new firestore.Timestamp(new Date('2024-01-02')) },
      }),
    );

    const out = await repo.getById('b1');

    expect(out?.data).toEqual(new Date('2024-01-02'));
  });

  it('getPaginated: retorna beneficios e lastDoc', async () => {
    const { BeneficioRepository } = await import('@/model/repositories/beneficioRepository');
    const repo = new BeneficioRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(data)');
    firestore.limit.mockReturnValue('limit(1)');
    firestore.query.mockReturnValue({ q: true });

    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([createFirestoreDoc('b1', { nome: 'N', data: { toDate: () => new Date('2024-01-01') } })]),
    );

    const out = await repo.getPaginated(1);

    expect(out.beneficios).toHaveLength(1);
    expect(out.lastDoc).toBeDefined();
  });

  it('create: usa Timestamp.now quando data não é informada', async () => {
    const { BeneficioRepository } = await import('@/model/repositories/beneficioRepository');
    const repo = new BeneficioRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.create({
      nome: 'N',
      tipo: 'T',
      responsavelUID: 'u',
      responsavelNome: 'r',
      cliente: 'c',
    } as any);

    expect(id).toBe('new-id');
    expect(firestore.Timestamp.now).toHaveBeenCalledTimes(1);
  });

  it('update: remove campos virtuais e converte data', async () => {
    const { BeneficioRepository } = await import('@/model/repositories/beneficioRepository');
    const repo = new BeneficioRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.updateDoc.mockResolvedValue(undefined);

    await repo.update('b1', {
      id: 'b1',
      ativo: true,
      dataCriacao: new Date(),
      descricao: 'x',
      data: new Date('2024-02-01'),
      subtipo: 's',
    } as any);

    expect(firestore.Timestamp.fromDate).toHaveBeenCalledWith(new Date('2024-02-01'));
    const payload = firestore.updateDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('ativo');
    expect(payload).not.toHaveProperty('dataCriacao');
    expect(payload).not.toHaveProperty('descricao');
  });

  it('getAll: retorna vazio quando não há docs', async () => {
    const { BeneficioRepository } = await import('@/model/repositories/beneficioRepository');
    const repo = new BeneficioRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(data)');
    firestore.limit.mockReturnValue('limit(300)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.getAll();

    expect(out).toEqual([]);
  });
});

