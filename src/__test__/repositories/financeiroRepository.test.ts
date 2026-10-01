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
    deleteField: vi.fn(() => '__DELETE_FIELD__'),
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
    expect(out.map((r) => r.id)).toEqual(['r2', 'r1']);
    expect(out[0]?.dataVencimento.getFullYear()).toBe(2024);
    expect(out[0]?.dataVencimento.getMonth()).toBe(1);
    expect(out[0]?.dataVencimento.getDate()).toBe(1);
    expect(out[0]?.dataVencimento.getHours()).toBe(12);
  });

  it('getReceitas: sem filtro usa orderBy(dataVencimento, desc)', async () => {
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

    expect(firestore.orderBy).toHaveBeenCalledWith('dataVencimento', 'desc');
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
    expect(out[0]?.data.getFullYear()).toBe(2024);
    expect(out[0]?.data.getMonth()).toBe(1);
    expect(out[0]?.data.getDate()).toBe(1);
    expect(out[0]?.data.getHours()).toBe(12);
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

  it('addReceita e addCusto: persistem advogadoResponsavel quando fornecido', async () => {
    const { FinanceiroRepository } = await import('@/model/repositories/financeiroRepository');
    firestore.collection
      .mockReturnValueOnce({ c: 'receitas' })
      .mockReturnValueOnce({ c: 'projecoes' })
      .mockReturnValueOnce({ c: 'custos' });
    const repo = new FinanceiroRepository();
    firestore.addDoc.mockResolvedValue({ id: 'rec-1' });

    await repo.addReceita({
      descricao: 'Honorários Processo 123',
      categoria: 'Honorários Advocatícios',
      advogadoResponsavel: 'Daiane Clara',
      dataVencimento: new Date('2026-10-01'),
      valorTotal: 1500,
      valorPago: 1500,
      valorAberto: 0,
      status: 'pago',
      origem: '',
    });

    const receitaPayload = firestore.addDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(receitaPayload).toHaveProperty('advogadoResponsavel', 'Daiane Clara');

    firestore.addDoc.mockResolvedValue({ id: 'custo-1' });
    await repo.addCusto({
      descricao: 'Custas Honorários',
      categoria: 'Honorários Advocatícios',
      advogadoResponsavel: 'Thiago Oliveira',
      data: new Date('2026-10-01'),
      valor: 200,
      pago: true,
      recorrente: false,
      origem: '',
    });

    const custoPayload = firestore.addDoc.mock.calls[1]?.[1] as Record<string, unknown>;
    expect(custoPayload).toHaveProperty('advogadoResponsavel', 'Thiago Oliveira');
  });

  it('addReceita e addCusto: removem campos undefined para evitar erro do Firestore', async () => {
    const { FinanceiroRepository } = await import('@/model/repositories/financeiroRepository');
    firestore.collection
      .mockReturnValueOnce({ c: 'receitas' })
      .mockReturnValueOnce({ c: 'projecoes' })
      .mockReturnValueOnce({ c: 'custos' });
    const repo = new FinanceiroRepository();
    firestore.addDoc.mockResolvedValue({ id: 'rec-2' });

    await repo.addReceita({
      descricao: 'Receita sem advogado',
      categoria: 'Consultoria',
      advogadoResponsavel: undefined,
      dataVencimento: new Date('2026-10-01'),
      valorTotal: 500,
      valorPago: 0,
      valorAberto: 500,
      status: 'pendente',
      origem: '',
    });

    const receitaPayload = firestore.addDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(receitaPayload).not.toHaveProperty('advogadoResponsavel');

    firestore.addDoc.mockResolvedValue({ id: 'custo-2' });
    await repo.addCusto({
      descricao: 'Custo Folha de Pagamento',
      categoria: 'Despesa de Pessoal',
      subcategoria: 'Folha de Pagamento',
      advogadoResponsavel: undefined,
      data: new Date('2026-10-01'),
      valor: 600,
      pago: true,
      recorrente: true,
      origem: '',
    });

    const custoPayload = firestore.addDoc.mock.calls[1]?.[1] as Record<string, unknown>;
    expect(custoPayload).not.toHaveProperty('advogadoResponsavel');
  });

  it('updateReceita e updateCusto: convertem campos undefined para deleteField', async () => {
    const { FinanceiroRepository } = await import('@/model/repositories/financeiroRepository');
    firestore.collection
      .mockReturnValueOnce({ c: 'receitas' })
      .mockReturnValueOnce({ c: 'projecoes' })
      .mockReturnValueOnce({ c: 'custos' });
    const repo = new FinanceiroRepository();
    firestore.doc.mockReturnValue({ d: true });
    firestore.updateDoc.mockResolvedValue(undefined);

    await repo.updateReceita('rec-1', {
      descricao: 'Atualizado',
      advogadoResponsavel: undefined,
    });

    const updateReceitaPayload = firestore.updateDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(updateReceitaPayload.advogadoResponsavel).toBe('__DELETE_FIELD__');

    await repo.updateCusto('custo-1', {
      descricao: 'Atualizado',
      advogadoResponsavel: undefined,
    });

    const updateCustoPayload = firestore.updateDoc.mock.calls[1]?.[1] as Record<string, unknown>;
    expect(updateCustoPayload.advogadoResponsavel).toBe('__DELETE_FIELD__');
  });
});
