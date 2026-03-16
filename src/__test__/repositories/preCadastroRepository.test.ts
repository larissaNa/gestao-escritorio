import { createFirestoreDoc, createQuerySnapshot } from '../helpers/firestoreTestData';
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
    doc: vi.fn(),
    getDocs: vi.fn(),
    orderBy: vi.fn(),
    query: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('@/model/services/firebase', () => ({ db: {} }));

describe('PreCadastroRepository', () => {
  beforeEach(() => {
    firestore.addDoc.mockReset();
    firestore.collection.mockReset();
    firestore.doc.mockReset();
    firestore.getDocs.mockReset();
    firestore.orderBy.mockReset();
    firestore.query.mockReset();
    firestore.updateDoc.mockReset();
    firestore.where.mockReset();
    firestore.Timestamp.now.mockClear();
  });

  it('create: adiciona dataCadastro Timestamp.now e retorna id', async () => {
    const { PreCadastroRepository } = await import('@/model/repositories/preCadastroRepository');
    const repo = new PreCadastroRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.create({ nome: 'N' } as any);

    expect(id).toBe('new-id');
    expect(firestore.Timestamp.now).toHaveBeenCalledTimes(1);
  });

  it('updateStatus: chama updateDoc com status', async () => {
    const { PreCadastroRepository } = await import('@/model/repositories/preCadastroRepository');
    const repo = new PreCadastroRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.updateDoc.mockResolvedValue(undefined);

    await repo.updateStatus('p1', 'aguardando' as any);

    expect(firestore.updateDoc).toHaveBeenCalledWith({ d: true }, { status: 'aguardando' });
  });

  it('getByStatus: aplica where(status == x) e retorna vazio quando não há docs', async () => {
    const { PreCadastroRepository } = await import('@/model/repositories/preCadastroRepository');
    const repo = new PreCadastroRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(status)');
    firestore.orderBy.mockReturnValue('orderBy(dataCadastro)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.getByStatus('aguardando' as any);

    expect(firestore.where).toHaveBeenCalledWith('status', '==', 'aguardando');
    expect(out).toEqual([]);
  });

  it('getAll: converte dataCadastro.toDate()', async () => {
    const { PreCadastroRepository } = await import('@/model/repositories/preCadastroRepository');
    const repo = new PreCadastroRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(dataCadastro)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([
        createFirestoreDoc('p1', { dataCadastro: new firestore.Timestamp(new Date('2024-01-02')) }),
      ]),
    );

    const out = await repo.getAll();

    expect(out[0]?.dataCadastro).toEqual(new Date('2024-01-02'));
  });
});

