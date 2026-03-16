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
    static now = vi.fn(() => new Timestamp(new Date('2024-03-10T00:00:00.000Z')));
  }

  return {
    Timestamp,
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    orderBy: vi.fn(),
    query: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('@/model/services/firebase', () => ({ db: {} }));

describe('RelatorioRepository', () => {
  beforeEach(() => {
    firestore.addDoc.mockReset();
    firestore.collection.mockReset();
    firestore.deleteDoc.mockReset();
    firestore.doc.mockReset();
    firestore.getDoc.mockReset();
    firestore.getDocs.mockReset();
    firestore.orderBy.mockReset();
    firestore.query.mockReset();
    firestore.updateDoc.mockReset();
    firestore.where.mockReset();
    firestore.Timestamp.now.mockClear();
  });

  it('create: adiciona data Timestamp.now e mes baseado em Date', async () => {
    const { RelatorioRepository } = await import('@/model/repositories/relatorioRepository');
    const repo = new RelatorioRepository();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-08-15T12:00:00.000Z'));

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.create({ responsavel: 'R' } as any);

    expect(id).toBe('new-id');
    const payload = firestore.addDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).toHaveProperty('data');
    expect(payload).toHaveProperty('mes', 8);

    vi.useRealTimers();
  });

  it('getById: retorna null quando documento não existe', async () => {
    const { RelatorioRepository } = await import('@/model/repositories/relatorioRepository');
    const repo = new RelatorioRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 'r1', data: null }));

    const out = await repo.getById('r1');

    expect(out).toBeNull();
  });

  it('getAll: retorna lista vazia quando não há docs', async () => {
    const { RelatorioRepository } = await import('@/model/repositories/relatorioRepository');
    const repo = new RelatorioRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(data)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.getAll();

    expect(out).toEqual([]);
  });

  it('getBySetor: aplica where(setor == x)', async () => {
    const { RelatorioRepository } = await import('@/model/repositories/relatorioRepository');
    const repo = new RelatorioRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(setor)');
    firestore.orderBy.mockReturnValue('orderBy(data)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([createFirestoreDoc('r1', { data: { toDate: () => new Date('2024-01-01') } })]),
    );

    const out = await repo.getBySetor('S');

    expect(firestore.where).toHaveBeenCalledWith('setor', '==', 'S');
    expect(out).toHaveLength(1);
  });
});

