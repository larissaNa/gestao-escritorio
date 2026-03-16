import { createDocSnapshot, createFirestoreDoc, createQuerySnapshot } from '../helpers/firestoreTestData';
import { describe, it, expect, vi, beforeEach } from "vitest";

const firestore = vi.hoisted(() => {
  return {
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

describe('ServicoRepository', () => {
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
  });

  it('create: retorna id do documento criado', async () => {
    const { ServicoRepository } = await import('@/model/repositories/servicoRepository');
    const repo = new ServicoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.create({ area: 'A', tipoAcao: 'T' } as any);

    expect(id).toBe('new-id');
    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
  });

  it('getAll: retorna vazio quando não há docs', async () => {
    const { ServicoRepository } = await import('@/model/repositories/servicoRepository');
    const repo = new ServicoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValueOnce('orderBy(area)').mockReturnValueOnce('orderBy(tipoAcao)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.getAll();

    expect(out).toEqual([]);
  });

  it('getByArea: aplica where(area == x)', async () => {
    const { ServicoRepository } = await import('@/model/repositories/servicoRepository');
    const repo = new ServicoRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(area)');
    firestore.orderBy.mockReturnValue('orderBy(tipoAcao)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([createFirestoreDoc('s1', { area: 'A', tipoAcao: 'T' })]),
    );

    const out = await repo.getByArea('A');

    expect(firestore.where).toHaveBeenCalledWith('area', '==', 'A');
    expect(out).toHaveLength(1);
  });

  it('getById: retorna null quando documento não existe', async () => {
    const { ServicoRepository } = await import('@/model/repositories/servicoRepository');
    const repo = new ServicoRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 's1', data: null }));

    const out = await repo.getById('s1');

    expect(out).toBeNull();
  });
});

