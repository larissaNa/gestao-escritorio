import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    getByArea: vi.fn(),
    getByAdvogado: vi.fn(),
    getById: vi.fn(),
  };
});

vi.mock('@/model/repositories/servicoRepository', () => ({
  servicoRepository: repoMock,
}));

describe('ServicoService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('buscarPorId: delega para repository.getById', async () => {
    const { ServicoService } = await import('@/model/services/servicoService');
    const service = new ServicoService();
    repoMock.getById.mockResolvedValue({ id: 's1' });

    const out = await service.buscarPorId('s1');

    expect(out).toEqual({ id: 's1' });
    expect(repoMock.getById).toHaveBeenCalledWith('s1');
  });

  it('obterAreas: remove duplicados e ordena', async () => {
    const { ServicoService } = await import('@/model/services/servicoService');
    const service = new ServicoService();

    repoMock.getAll.mockResolvedValue([{ area: 'Z' }, { area: 'A' }, { area: 'Z' }] as any);

    const out = await service.obterAreas();

    expect(out).toEqual(['A', 'Z']);
    expect(repoMock.getAll).toHaveBeenCalledTimes(1);
  });
});

