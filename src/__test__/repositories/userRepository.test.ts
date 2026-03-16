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

describe('UserRepository', () => {
  beforeEach(() => {
    firestore.doc.mockReset();
    firestore.getDoc.mockReset();
    firestore.setDoc.mockReset();
  });

  it('getById: retorna null quando uid não é informado', async () => {
    const { UserRepository } = await import('@/model/repositories/userRepository');
    const repo = new UserRepository();

    const out = await repo.getById(undefined);

    expect(out).toBeNull();
    expect(firestore.getDoc).not.toHaveBeenCalled();
  });

  it('getById: retorna dados quando documento existe', async () => {
    const { UserRepository } = await import('@/model/repositories/userRepository');
    const repo = new UserRepository();

    const docRef = { d: true };
    firestore.doc.mockReturnValue(docRef);
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' }),
    });

    const out = await repo.getById('uid-1');

    expect(firestore.doc).toHaveBeenCalledWith({}, 'users', 'uid-1');
    expect(out).toEqual({ role: 'admin' });
  });

  it('getById: retorna null quando documento não existe', async () => {
    const { UserRepository } = await import('@/model/repositories/userRepository');
    const repo = new UserRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValue({ exists: () => false });

    const out = await repo.getById('uid-1');

    expect(out).toBeNull();
  });

  it('save: remove campos undefined antes de salvar', async () => {
    const { UserRepository } = await import('@/model/repositories/userRepository');
    const repo = new UserRepository();

    const docRef = { d: true };
    firestore.doc.mockReturnValue(docRef);
    firestore.setDoc.mockResolvedValue(undefined);

    await repo.save('uid-1', { a: 1, b: undefined, c: null });

    expect(firestore.setDoc).toHaveBeenCalledWith(docRef, { a: 1, c: null });
  });

  it('update: remove undefined e usa merge true', async () => {
    const { UserRepository } = await import('@/model/repositories/userRepository');
    const repo = new UserRepository();

    const docRef = { d: true };
    firestore.doc.mockReturnValue(docRef);
    firestore.setDoc.mockResolvedValue(undefined);

    await repo.update('uid-1', { a: 1, b: undefined });

    expect(firestore.setDoc).toHaveBeenCalledWith(docRef, { a: 1 }, { merge: true });
  });

  it('save: relança erro quando setDoc falha', async () => {
    const { UserRepository } = await import('@/model/repositories/userRepository');
    const repo = new UserRepository();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    firestore.doc.mockReturnValue({ d: true });
    firestore.setDoc.mockRejectedValue(new Error('boom'));

    await expect(repo.save('uid-1', { a: 1 })).rejects.toThrow('boom');
  });
});

