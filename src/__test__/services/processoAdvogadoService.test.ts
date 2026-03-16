import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
});

vi.mock('@/model/repositories/processoAdvogadoRepository', () => ({
  processoAdvogadoRepository: repoMock,
}));

describe('processoAdvogadoService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('list: delega para repository', async () => {
    const { processoAdvogadoService } = await import('@/model/services/processoAdvogadoService');
    repoMock.list.mockResolvedValue([{ id: '1' }]);

    const out = await processoAdvogadoService.list('u1', true, 10);

    expect(repoMock.list).toHaveBeenCalledWith('u1', true, 10);
    expect(out).toEqual([{ id: '1' }]);
  });

  it('calcularExito: conta procedente/parcialmente_procedente e improcedente', async () => {
    const { processoAdvogadoService } = await import('@/model/services/processoAdvogadoService');

    const out = processoAdvogadoService.calcularExito([
      { status: 'procedente' },
      { status: 'parcialmente_procedente' },
      { status: 'improcedente' },
      { status: 'em_andamento' },
    ] as any);

    expect(out).toEqual({ exito: 2, naoExito: 1 });
  });
});

