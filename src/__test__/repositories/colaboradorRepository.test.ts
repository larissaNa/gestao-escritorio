import { createDocSnapshot, createFirestoreDoc, createQuerySnapshot } from '../helpers/firestoreTestData';
import { describe, it, expect, vi, beforeEach } from "vitest";

const firestore = vi.hoisted(() => {
  return {
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    updateDoc: vi.fn(),
    writeBatch: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('@/model/services/firebase', () => ({ db: {} }));

describe('ColaboradorRepository', () => {
  beforeEach(() => {
    firestore.collection.mockReset();
    firestore.deleteDoc.mockReset();
    firestore.doc.mockReset();
    firestore.getDoc.mockReset();
    firestore.getDocs.mockReset();
    firestore.query.mockReset();
    firestore.where.mockReset();
  });

  it('getById: retorna null quando documento não existe', async () => {
    const { ColaboradorRepository } = await import('@/model/repositories/colaboradorRepository');
    const repo = new ColaboradorRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 'c1', data: null }));

    const out = await repo.getById('c1');

    expect(out).toBeNull();
  });

  it('getById: usa uid do documento quando uid não está presente', async () => {
    const { ColaboradorRepository } = await import('@/model/repositories/colaboradorRepository');
    const repo = new ColaboradorRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(
      createDocSnapshot({
        id: 'c1',
        data: { primeiroNome: 'A', sobreNome: 'B' },
      }),
    );

    const out = await repo.getById('c1');

    expect(out?.uid).toBe('c1');
    expect(out?.id).toBe('c1');
  });

  it('getAll: retorna lista vazia quando não há docs', async () => {
    const { ColaboradorRepository } = await import('@/model/repositories/colaboradorRepository');
    const repo = new ColaboradorRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const out = await repo.getAll();

    expect(out).toEqual([]);
  });

  it('getByRole: usa where(role == x) e retorna mapeado', async () => {
    const { ColaboradorRepository } = await import('@/model/repositories/colaboradorRepository');
    const repo = new ColaboradorRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(role)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([createFirestoreDoc('c1', { uid: 'u1', role: 'admin' })]),
    );

    const out = await repo.getByRole('admin');

    expect(firestore.where).toHaveBeenCalledWith('role', '==', 'admin');
    expect(out[0]?.uid).toBe('u1');
  });

  it('delete: chama deleteDoc com docRef correto', async () => {
    const { ColaboradorRepository } = await import('@/model/repositories/colaboradorRepository');
    const repo = new ColaboradorRepository();

    const docRef = { d: true };
    firestore.doc.mockReturnValue(docRef);
    firestore.deleteDoc.mockResolvedValue(undefined);

    await repo.delete('c1');

    expect(firestore.deleteDoc).toHaveBeenCalledWith(docRef);
  });
});

