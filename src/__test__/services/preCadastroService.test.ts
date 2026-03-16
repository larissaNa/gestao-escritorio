import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    create: vi.fn(),
    updateStatus: vi.fn(),
    getAll: vi.fn(),
    getByStatus: vi.fn(),
    getByResponsavel: vi.fn(),
  };
});

vi.mock('@/model/repositories/preCadastroRepository', () => ({
  preCadastroRepository: repoMock,
}));

describe('PreCadastroService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('buscarAguardando: delega para buscarPorStatus("aguardando")', async () => {
    const { PreCadastroService } = await import('@/model/services/preCadastroService');
    const service = new PreCadastroService();

    repoMock.getByStatus.mockResolvedValue([{ id: '1' }]);

    const out = await service.buscarAguardando();

    expect(repoMock.getByStatus).toHaveBeenCalledWith('aguardando');
    expect(out).toEqual([{ id: '1' }]);
  });

  it('contarPorStatus: retorna contagem por status', async () => {
    const { PreCadastroService } = await import('@/model/services/preCadastroService');
    const service = new PreCadastroService();

    repoMock.getByStatus.mockImplementation(async (status: string) => {
      if (status === 'aguardando') return [{}, {}];
      if (status === 'em_atendimento') return [{}];
      if (status === 'finalizado') return [];
      return [];
    });

    const out = await service.contarPorStatus();

    expect(repoMock.getByStatus).toHaveBeenCalledTimes(3);
    expect(out).toEqual({ aguardando: 2, em_atendimento: 1, finalizado: 0 });
  });
});

