import { describe, it, expect, vi, beforeEach } from "vitest";

const firebaseAppMock = vi.hoisted(() => {
  return {
    initializeApp: vi.fn(),
    getApps: vi.fn(),
    deleteApp: vi.fn(),
  };
});

const firebaseAuthMock = vi.hoisted(() => {
  return {
    getAuth: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
  };
});

const userRepoMock = vi.hoisted(() => {
  return {
    save: vi.fn(),
  };
});

vi.mock('firebase/app', async () => {
  const actual = await vi.importActual<any>('firebase/app');
  return {
    ...actual,
    initializeApp: firebaseAppMock.initializeApp,
    getApps: firebaseAppMock.getApps,
    deleteApp: firebaseAppMock.deleteApp,
  };
});

vi.mock('firebase/auth', () => firebaseAuthMock);
vi.mock('@/model/repositories/userRepository', () => ({ userRepository: userRepoMock }));
vi.mock('@/model/services/firebase', () => ({
  firebaseConfig: { projectId: 'x' },
}));

describe('adminAuthService', () => {
  beforeEach(() => {
    firebaseAppMock.initializeApp.mockReset();
    firebaseAppMock.getApps.mockReset();
    firebaseAppMock.deleteApp.mockReset();
    firebaseAuthMock.getAuth.mockReset();
    firebaseAuthMock.createUserWithEmailAndPassword.mockReset();
    firebaseAuthMock.signOut.mockReset();
    firebaseAuthMock.updateProfile.mockReset();
    userRepoMock.save.mockReset();
  });

  it('createUser: cria app secundário quando não existe e remove no finally', async () => {
    const { adminAuthService } = await import('@/model/services/adminAuthService');

    const secondaryApp = { name: 'secondaryApp' };
    firebaseAppMock.getApps.mockReturnValue([]);
    firebaseAppMock.initializeApp.mockReturnValue(secondaryApp);
    firebaseAuthMock.getAuth.mockReturnValue({ auth: true });
    firebaseAuthMock.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } });
    firebaseAuthMock.updateProfile.mockResolvedValue(undefined);
    userRepoMock.save.mockResolvedValue(undefined);
    firebaseAuthMock.signOut.mockResolvedValue(undefined);
    firebaseAppMock.deleteApp.mockResolvedValue(undefined);

    const user = await adminAuthService.createUser('a@b.com', 'pass', 'Nome', 'admin', [{ key: 'x' }] as any);

    expect(user).toEqual({ uid: 'u1' });
    expect(firebaseAppMock.initializeApp).toHaveBeenCalledTimes(1);
    expect(firebaseAuthMock.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(firebaseAuthMock.updateProfile).toHaveBeenCalledWith({ uid: 'u1' }, { displayName: 'Nome' });
    expect(userRepoMock.save).toHaveBeenCalledTimes(1);
    expect(firebaseAuthMock.signOut).toHaveBeenCalledTimes(1);
    expect(firebaseAppMock.deleteApp).toHaveBeenCalledWith(secondaryApp);
  });

  it('createUser: reutiliza app existente e não chama deleteApp', async () => {
    const { adminAuthService } = await import('@/model/services/adminAuthService');

    const existingApp = { name: 'secondaryApp' };
    firebaseAppMock.getApps.mockReturnValue([existingApp]);
    firebaseAuthMock.getAuth.mockReturnValue({ auth: true });
    firebaseAuthMock.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } });
    firebaseAuthMock.updateProfile.mockResolvedValue(undefined);
    userRepoMock.save.mockResolvedValue(undefined);
    firebaseAuthMock.signOut.mockResolvedValue(undefined);

    await adminAuthService.createUser('a@b.com', 'pass', 'Nome', 'admin');

    expect(firebaseAppMock.initializeApp).not.toHaveBeenCalled();
    expect(firebaseAppMock.deleteApp).not.toHaveBeenCalled();
  });

  it('createUser: relança erro e ainda chama deleteApp quando app foi criado', async () => {
    const { adminAuthService } = await import('@/model/services/adminAuthService');

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const secondaryApp = { name: 'secondaryApp' };
    firebaseAppMock.getApps.mockReturnValue([]);
    firebaseAppMock.initializeApp.mockReturnValue(secondaryApp);
    firebaseAuthMock.getAuth.mockReturnValue({ auth: true });
    firebaseAuthMock.createUserWithEmailAndPassword.mockRejectedValue(new Error('boom'));
    firebaseAppMock.deleteApp.mockResolvedValue(undefined);

    await expect(adminAuthService.createUser('a@b.com', 'pass', 'Nome', 'admin')).rejects.toThrow('boom');
    expect(firebaseAppMock.deleteApp).toHaveBeenCalledWith(secondaryApp);
  });
});

