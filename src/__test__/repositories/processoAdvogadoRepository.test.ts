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

describe('ProcessoAdvogadoRepository', () => {
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
    firestore.Timestamp.fromDate.mockClear();
  });

  it('list: quando isAdmin=true não aplica filtro uidAdvogado', async () => {
    const { ProcessoAdvogadoRepository } = await import('@/model/repositories/processoAdvogadoRepository');
    const repo = new ProcessoAdvogadoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(dataUltimaAtualizacao)');
    firestore.limit.mockReturnValue('limit(200)');
    firestore.query.mockImplementation((_c: any, ...rest: any[]) => ({ rest }));
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.list('u1', true, 200);

    expect(firestore.where).not.toHaveBeenCalled();
    expect(out).toEqual([]);
  });

  it('list: quando isAdmin=false aplica where(uidAdvogado == userUid)', async () => {
    const { ProcessoAdvogadoRepository } = await import('@/model/repositories/processoAdvogadoRepository');
    const repo = new ProcessoAdvogadoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(uidAdvogado)');
    firestore.orderBy.mockReturnValue('orderBy(dataUltimaAtualizacao)');
    firestore.limit.mockReturnValue('limit(200)');
    firestore.query.mockImplementation((_c: any, ...rest: any[]) => ({ rest }));
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    await repo.list('u1', false, 200);

    expect(firestore.where).toHaveBeenCalledWith('uidAdvogado', '==', 'u1');
  });

  it('getById: retorna null quando doc não existe', async () => {
    const { ProcessoAdvogadoRepository } = await import('@/model/repositories/processoAdvogadoRepository');
    const repo = new ProcessoAdvogadoRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 'p1', data: null }));

    const out = await repo.getById('p1');

    expect(out).toBeNull();
  });

  it('create: converte datas para Timestamp e usa null quando ausente', async () => {
    const { ProcessoAdvogadoRepository } = await import('@/model/repositories/processoAdvogadoRepository');
    const repo = new ProcessoAdvogadoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.create({
      dataUltimaAtualizacao: new Date('2024-01-01'),
      dataEntrada: undefined,
      dataFinalizacao: undefined,
    } as any);

    expect(id).toBe('new-id');
    expect(firestore.Timestamp.fromDate).toHaveBeenCalledWith(new Date('2024-01-01'));
    const payload = firestore.addDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).toHaveProperty('dataEntrada', null);
    expect(payload).toHaveProperty('dataFinalizacao', null);
  });

  it('update: remove campos undefined antes de atualizar', async () => {
    const { ProcessoAdvogadoRepository } = await import('@/model/repositories/processoAdvogadoRepository');
    const repo = new ProcessoAdvogadoRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.updateDoc.mockResolvedValue(undefined);

    await repo.update('p1', { dataEntrada: undefined, area: undefined, status: 'procedente' } as any);

    const payload = firestore.updateDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('dataEntrada');
    expect(payload).not.toHaveProperty('area');
    expect(payload).toHaveProperty('status', 'procedente');
  });
});

