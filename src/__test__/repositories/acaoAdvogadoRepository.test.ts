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

describe('AcaoAdvogadoRepository', () => {
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

  it('create: cria documento com dataCadastro Timestamp.now e retorna id', async () => {
    const { AcaoAdvogadoRepository } = await import('@/model/repositories/acaoAdvogadoRepository');
    const repo = new AcaoAdvogadoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.create({ cliente: 'c', advogado: 'a' } as any);

    expect(id).toBe('new-id');
    expect(firestore.Timestamp.now).toHaveBeenCalledTimes(1);
    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
    const payload = firestore.addDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).toHaveProperty('dataCadastro');
    expect(payload.cliente).toBe('c');
  });

  it('create: propaga erro quando addDoc falha', async () => {
    const { AcaoAdvogadoRepository } = await import('@/model/repositories/acaoAdvogadoRepository');
    const repo = new AcaoAdvogadoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockRejectedValue(new Error('boom'));

    await expect(repo.create({} as any)).rejects.toThrow('boom');
  });

  it('getById: retorna null quando documento não existe', async () => {
    const { AcaoAdvogadoRepository } = await import('@/model/repositories/acaoAdvogadoRepository');
    const repo = new AcaoAdvogadoRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 'id-1', data: null }));

    const out = await repo.getById('id-1');

    expect(out).toBeNull();
  });

  it('getById: mapeia Timestamp para Date e retorna entidade', async () => {
    const { AcaoAdvogadoRepository } = await import('@/model/repositories/acaoAdvogadoRepository');
    const repo = new AcaoAdvogadoRepository();

    const dataCadastro = new firestore.Timestamp(new Date('2024-01-01'));
    const prazo = new firestore.Timestamp(new Date('2024-02-01'));
    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(
      createDocSnapshot({
        id: 'id-1',
        data: { cliente: 'c', advogado: 'a', dataCadastro, prazo },
      }),
    );

    const out = await repo.getById('id-1');

    expect(out?.id).toBe('id-1');
    expect(out?.dataCadastro).toEqual(new Date('2024-01-01'));
    expect(out?.prazo).toEqual(new Date('2024-02-01'));
  });

  it('getByFilters: aplica filtros dinamicamente', async () => {
    const { AcaoAdvogadoRepository } = await import('@/model/repositories/acaoAdvogadoRepository');
    const repo = new AcaoAdvogadoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(dataCadastro)');
    firestore.query.mockImplementation((...args: any[]) => ({ args }));
    firestore.where.mockImplementation((field: string) => `where(${field})`);
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    await repo.getByFilters({ advogado: 'a', situacao: 's' });

    expect(firestore.where).toHaveBeenCalledWith('advogado', '==', 'a');
    expect(firestore.where).toHaveBeenCalledWith('situacao', '==', 's');
  });

  it('getAll: retorna lista vazia quando não há docs', async () => {
    const { AcaoAdvogadoRepository } = await import('@/model/repositories/acaoAdvogadoRepository');
    const repo = new AcaoAdvogadoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(dataCadastro)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.getAll();

    expect(out).toEqual([]);
  });
});

