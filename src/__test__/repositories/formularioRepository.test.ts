import { createDocSnapshot } from '../helpers/firestoreTestData';
import { describe, it, expect, vi, beforeEach } from "vitest";

const firestore = vi.hoisted(() => {
  return {
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('@/model/services/firebase', () => ({ db: {} }));

describe('FormularioRepository', () => {
  beforeEach(() => {
    firestore.doc.mockReset();
    firestore.getDoc.mockReset();
    firestore.setDoc.mockReset();
  });

  it('save: chama setDoc com dataAtualizacao', async () => {
    const { FormularioRepository } = await import('@/model/repositories/formularioRepository');
    const repo = new FormularioRepository();

    const docRef = { d: true };
    firestore.doc.mockReturnValue(docRef);
    firestore.setDoc.mockResolvedValue(undefined);

    await repo.save('u1', { primeiroNome: 'A' } as any);

    expect(firestore.doc).toHaveBeenCalledWith({}, 'colaboradores', 'u1');
    const payload = firestore.setDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.primeiroNome).toBe('A');
    expect(payload).toHaveProperty('dataAtualizacao');
  });

  it('getById: retorna null quando doc não existe', async () => {
    const { FormularioRepository } = await import('@/model/repositories/formularioRepository');
    const repo = new FormularioRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue(createDocSnapshot({ id: 'u1', data: null }));

    const out = await repo.getById('u1');

    expect(out).toBeNull();
  });
});

