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
    orderBy: vi.fn(),
    query: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('@/model/services/firebase', () => ({ db: {} }));

describe('IdaBancoRepository', () => {
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
    firestore.Timestamp.fromDate.mockClear();
  });

  it('add: adiciona ida com createdAt e dataIda Timestamp', async () => {
    const { IdaBancoRepository } = await import('@/model/repositories/idasBancoRepository');
    const repo = new IdaBancoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.add({
      clienteNome: 'C',
      responsavelId: 'r',
      responsavelNome: 'R',
      dataIda: new Date('2024-02-01'),
      banco: 'B',
      numeroIda: 1,
      observacoes: undefined,
    } as any);

    expect(id).toBe('new-id');
    expect(firestore.Timestamp.now).toHaveBeenCalledTimes(1);
    expect(firestore.Timestamp.fromDate).toHaveBeenCalledWith(new Date('2024-02-01'));
  });

  it('getAll: mapeia dataIda.toDate()', async () => {
    const { IdaBancoRepository } = await import('@/model/repositories/idasBancoRepository');
    const repo = new IdaBancoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(dataIda)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([
        createFirestoreDoc('i1', { clienteNome: 'C', dataIda: new firestore.Timestamp(new Date('2024-01-01')) }),
      ]),
    );

    const out = await repo.getAll();

    expect(out[0]?.dataIda).toEqual(new Date('2024-01-01'));
  });

  it('getById: retorna null quando doc não existe', async () => {
    const { IdaBancoRepository } = await import('@/model/repositories/idasBancoRepository');
    const repo = new IdaBancoRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 'i1', data: null }));

    const out = await repo.getById('i1');

    expect(out).toBeNull();
  });

  it('countByCliente: retorna querySnapshot.size', async () => {
    const { IdaBancoRepository } = await import('@/model/repositories/idasBancoRepository');
    const repo = new IdaBancoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(clienteNome)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue({ size: 3 });

    const out = await repo.countByCliente('C');

    expect(out).toBe(3);
  });

  it('update: remove id/createdAt e converte dataIda', async () => {
    const { IdaBancoRepository } = await import('@/model/repositories/idasBancoRepository');
    const repo = new IdaBancoRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.updateDoc.mockResolvedValue(undefined);

    await repo.update('i1', { id: 'i1', createdAt: new Date(), dataIda: new Date('2024-03-01') } as any);

    expect(firestore.Timestamp.fromDate).toHaveBeenCalledWith(new Date('2024-03-01'));
    const payload = firestore.updateDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('createdAt');
  });
});

