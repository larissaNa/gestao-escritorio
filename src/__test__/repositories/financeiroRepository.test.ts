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
    static now = vi.fn(() => new Timestamp(new Date('2024-01-10T00:00:00.000Z')));
    static fromDate = vi.fn((d: Date) => new Timestamp(d));
  }

  return {
    Timestamp,
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
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

describe('FinanceiroRepository', () => {
  beforeEach(() => {
    firestore.addDoc.mockReset();
    firestore.collection.mockReset();
    firestore.deleteDoc.mockReset();
    firestore.doc.mockReset();
    firestore.getDocs.mockReset();
    firestore.orderBy.mockReset();
    firestore.query.mockReset();
    firestore.updateDoc.mockReset();
    firestore.where.mockReset();
    firestore.Timestamp.now.mockClear();
    firestore.Timestamp.fromDate.mockClear();
  });

  it('getReceitas: quando filtra por escritório, ordena no client por dataVencimento', async () => {
    const { FinanceiroRepository } = await import('@/model/repositories/financeiroRepository');
    firestore.collection
      .mockReturnValueOnce({ c: 'receitas' })
      .mockReturnValueOnce({ c: 'projecoes' })
      .mockReturnValueOnce({ c: 'custos' });
    const repo = new FinanceiroRepository();
    firestore.where.mockReturnValue('where(escritorio)');
    firestore.query.mockReturnValue({ q: true });

    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([
        createFirestoreDoc('r2', { dataVencimento: { toDate: () => new Date('2024-02-01') }, valorTotal: 0, valorPago: 0, valorAberto: 0 }),
        createFirestoreDoc('r1', { dataVencimento: { toDate: () => new Date('2024-01-01') }, valorTotal: 0, valorPago: 0, valorAberto: 0 }),
      ]),
    );

    const out = await repo.getReceitas({ escritorio: 'X' });

    expect(firestore.where).toHaveBeenCalledWith('escritorio', '==', 'X');
    expect(out.map((r) => r.id)).toEqual(['r1', 'r2']);
    expect(out[0]?.dataVencimento).toEqual(new Date('2024-01-01'));
  });

  it('getReceitas: sem filtro usa orderBy(dataVencimento, asc)', async () => {
    const { FinanceiroRepository } = await import('@/model/repositories/financeiroRepository');
    firestore.collection
      .mockReturnValueOnce({ c: 'receitas' })
      .mockReturnValueOnce({ c: 'projecoes' })
      .mockReturnValueOnce({ c: 'custos' });
    const repo = new FinanceiroRepository();
    firestore.orderBy.mockReturnValue('orderBy(dataVencimento)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.getReceitas();

    expect(firestore.orderBy).toHaveBeenCalledWith('dataVencimento', 'asc');
    expect(out).toEqual([]);
  });

  it('addReceita: converte dataVencimento para Timestamp e adiciona createdAt', async () => {
    const { FinanceiroRepository } = await import('@/model/repositories/financeiroRepository');
    firestore.collection
      .mockReturnValueOnce({ c: 'receitas' })
      .mockReturnValueOnce({ c: 'projecoes' })
      .mockReturnValueOnce({ c: 'custos' });
    const repo = new FinanceiroRepository();
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.addReceita({
      descricao: 'd',
      valorTotal: 100,
      valorPago: 0,
      valorAberto: 100,
      dataVencimento: new Date('2024-05-01'),
      escritorio: 'X',
      status: 'pendente',
    } as any);

    expect(id).toBe('new-id');
    expect(firestore.Timestamp.fromDate).toHaveBeenCalledWith(new Date('2024-05-01'));
    expect(firestore.Timestamp.now).toHaveBeenCalled();
    const payload = firestore.addDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).toHaveProperty('createdAt');
    expect(payload).toHaveProperty('dataVencimento');
  });

  it('updateReceita: converte dataVencimento quando presente', async () => {
    const { FinanceiroRepository } = await import('@/model/repositories/financeiroRepository');
    firestore.collection
      .mockReturnValueOnce({ c: 'receitas' })
      .mockReturnValueOnce({ c: 'projecoes' })
      .mockReturnValueOnce({ c: 'custos' });
    const repo = new FinanceiroRepository();
    firestore.doc.mockReturnValue({ d: true });
    firestore.updateDoc.mockResolvedValue(undefined);

    await repo.updateReceita('r1', { dataVencimento: new Date('2024-06-01') } as any);

    expect(firestore.Timestamp.fromDate).toHaveBeenCalledWith(new Date('2024-06-01'));
    expect(firestore.updateDoc).toHaveBeenCalledTimes(1);
  });

  it('getCustos: quando filtra por escritório, ordena no client por data desc', async () => {
    const { FinanceiroRepository } = await import('@/model/repositories/financeiroRepository');
    firestore.collection
      .mockReturnValueOnce({ c: 'receitas' })
      .mockReturnValueOnce({ c: 'projecoes' })
      .mockReturnValueOnce({ c: 'custos' });
    const repo = new FinanceiroRepository();
    firestore.where.mockReturnValue('where(escritorio)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([
        createFirestoreDoc('c1', { data: { toDate: () => new Date('2024-01-01') }, valor: 10 }),
        createFirestoreDoc('c2', { data: { toDate: () => new Date('2024-02-01') }, valor: 10 }),
      ]),
    );

    const out = await repo.getCustos({ escritorio: 'X' });

    expect(out.map((c) => c.id)).toEqual(['c2', 'c1']);
  });

  it('deleteCusto: chama deleteDoc com docRef correto', async () => {
    const { FinanceiroRepository } = await import('@/model/repositories/financeiroRepository');
    firestore.collection
      .mockReturnValueOnce({ c: 'receitas' })
      .mockReturnValueOnce({ c: 'projecoes' })
      .mockReturnValueOnce({ c: 'custos' });
    const repo = new FinanceiroRepository();
    const docRef = { d: true };
    firestore.doc.mockReturnValue(docRef);
    firestore.deleteDoc.mockResolvedValue(undefined);

    await repo.deleteCusto('c1');

    expect(firestore.doc).toHaveBeenCalledWith({ c: 'custos' }, 'c1');
    expect(firestore.deleteDoc).toHaveBeenCalledWith(docRef);
  });
});
