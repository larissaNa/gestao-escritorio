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
    updateDoc: vi.fn(),
    where: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('@/model/services/firebase', () => ({ db: {} }));

describe('ClienteRepository', () => {
  beforeEach(() => {
    firestore.addDoc.mockReset();
    firestore.collection.mockReset();
    firestore.doc.mockReset();
    firestore.getDoc.mockReset();
    firestore.getDocs.mockReset();
    firestore.limit.mockReset();
    firestore.orderBy.mockReset();
    firestore.query.mockReset();
    firestore.updateDoc.mockReset();
    firestore.where.mockReset();
    firestore.Timestamp.fromDate.mockClear();
  });

  it('getByCpf: retorna null quando querySnapshot.empty é true', async () => {
    const { ClienteRepository } = await import('@/model/repositories/clienteRepository');
    const repo = new ClienteRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(cpf)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue({ empty: true, docs: [] });

    const out = await repo.getByCpf('123');

    expect(out).toBeNull();
  });

  it('getByCpf: converte dataCadastro para Date', async () => {
    const { ClienteRepository } = await import('@/model/repositories/clienteRepository');
    const repo = new ClienteRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(cpf)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue({
      empty: false,
      docs: [createFirestoreDoc('id-1', { nome: 'N', dataCadastro: { toDate: () => new Date('2024-01-01') } })],
    });

    const out = await repo.getByCpf('123');

    expect(out?.id).toBe('id-1');
    expect(out?.dataCadastro).toEqual(new Date('2024-01-01'));
  });

  it('getByPartialCpf: aplica range e limit 5', async () => {
    const { ClienteRepository } = await import('@/model/repositories/clienteRepository');
    const repo = new ClienteRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockImplementation((field: string, op: string, val: string) => `where(${field}${op}${val})`);
    firestore.orderBy.mockReturnValue('orderBy(cpf)');
    firestore.limit.mockReturnValue('limit(5)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    await repo.getByPartialCpf('123');

    expect(firestore.where).toHaveBeenCalledWith('cpf', '>=', '123');
    expect(firestore.where).toHaveBeenCalledWith('cpf', '<=', '123' + '\uf8ff');
    expect(firestore.limit).toHaveBeenCalledWith(5);
  });

  it('create: converte dataCadastro para Timestamp.fromDate', async () => {
    const { ClienteRepository } = await import('@/model/repositories/clienteRepository');
    const repo = new ClienteRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.create({ nome: 'N', dataCadastro: new Date('2024-01-01') } as any);

    expect(id).toBe('new-id');
    expect(firestore.Timestamp.fromDate).toHaveBeenCalledWith(new Date('2024-01-01'));
  });

  it('getById: retorna null quando doc não existe', async () => {
    const { ClienteRepository } = await import('@/model/repositories/clienteRepository');
    const repo = new ClienteRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 'id-1', data: null }));

    const out = await repo.getById('id-1');

    expect(out).toBeNull();
  });
});

