import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    getByResponsavel: vi.fn(),
    getByTipoAcao: vi.fn(),
    getBySetor: vi.fn(),
  };
});

vi.mock('@/model/repositories/relatorioRepository', () => ({
  relatorioRepository: repoMock,
}));

describe('RelatorioService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('criarRelatorio: delega para repository.create', async () => {
    const { RelatorioService } = await import('@/model/services/relatorioService');
    const service = new RelatorioService();
    repoMock.create.mockResolvedValue('new-id');

    const id = await service.criarRelatorio({ responsavel: 'R' } as any);

    expect(id).toBe('new-id');
    expect(repoMock.create).toHaveBeenCalledWith({ responsavel: 'R' });
  });

  it('getById: retorna null quando repository retorna null', async () => {
    const { RelatorioService } = await import('@/model/services/relatorioService');
    const service = new RelatorioService();
    repoMock.getById.mockResolvedValue(null);

    const out = await service.getById('r1');

    expect(out).toBeNull();
    expect(repoMock.getById).toHaveBeenCalledWith('r1');
  });
});

