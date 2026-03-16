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

describe('ConcessaoRepository', () => {
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
    firestore.updateDoc.mockReset();
    firestore.where.mockReset();
    firestore.Timestamp.now.mockClear();
    firestore.Timestamp.fromDate.mockClear();
  });

  it('getById: retorna null quando documento não existe', async () => {
    const { ConcessaoRepository } = await import('@/model/repositories/concessaoRepository');
    const repo = new ConcessaoRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 'c1', data: null }));

    const out = await repo.getById('c1');

    expect(out).toBeNull();
  });

  it('create: usa Timestamp.now quando data não é informada', async () => {
    const { ConcessaoRepository } = await import('@/model/repositories/concessaoRepository');
    const repo = new ConcessaoRepository();

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

  it('getAll: retorna vazio quando não há docs', async () => {
    const { ConcessaoRepository } = await import('@/model/repositories/concessaoRepository');
    const repo = new ConcessaoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(data)');
    firestore.limit.mockReturnValue('limit(300)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.getAll();

    expect(out).toEqual([]);
  });

  it('getByTipo: aplica where(tipo == x)', async () => {
    const { ConcessaoRepository } = await import('@/model/repositories/concessaoRepository');
    const repo = new ConcessaoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(tipo)');
    firestore.orderBy.mockReturnValue('orderBy(data)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([createFirestoreDoc('c1', { nome: 'N', data: { toDate: () => new Date('2024-01-01') } })]),
    );

    const out = await repo.getByTipo('T');

    expect(firestore.where).toHaveBeenCalledWith('tipo', '==', 'T');
    expect(out).toHaveLength(1);
  });
});

