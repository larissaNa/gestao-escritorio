import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    getByFilters: vi.fn(),
  };
});

vi.mock('@/model/repositories/acaoAdvogadoRepository', () => ({
  acaoAdvogadoRepository: repoMock,
}));

describe('AcaoAdvogadoService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('buscarAreas: lança erro de método não implementado', async () => {
    const { AcaoAdvogadoService } = await import('@/model/services/acaoAdvogadoService');
    const service = new AcaoAdvogadoService();

    expect(() => service.buscarAreas()).toThrow('Method not implemented.');
  });

  it('criarAcao: delega para repository.create', async () => {
    const { AcaoAdvogadoService } = await import('@/model/services/acaoAdvogadoService');
    const service = new AcaoAdvogadoService();
    repoMock.create.mockResolvedValue('new-id');

    const id = await service.criarAcao({} as any);

    expect(id).toBe('new-id');
    expect(repoMock.create).toHaveBeenCalledTimes(1);
  });

  it('buscarComFiltros: delega para repository.getByFilters', async () => {
    const { AcaoAdvogadoService } = await import('@/model/services/acaoAdvogadoService');
    const service = new AcaoAdvogadoService();
    repoMock.getByFilters.mockResolvedValue([{ id: '1' }]);

    const out = await service.buscarComFiltros({ area: 'A' });

    expect(repoMock.getByFilters).toHaveBeenCalledWith({ area: 'A' });
    expect(out).toEqual([{ id: '1' }]);
  });
});

