import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock('firebase/firestore', () => ({
  QueryDocumentSnapshot: class {},
  DocumentData: class {},
}));

const repoMock = vi.hoisted(() => {
  return {
    getAll: vi.fn(),
    getByCpf: vi.fn(),
    getPaginated: vi.fn(),
    getById: vi.fn(),
    getByPeriodo: vi.fn(),
    getCount: vi.fn(),
    getCountByPeriodo: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
});

vi.mock('@/model/repositories/atendimentoRepository', () => ({
  atendimentoRepository: repoMock,
}));

describe('atendimentoService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('getAtendimentosCountByYear: calcula período do ano e delega', async () => {
    const { atendimentoService } = await import('@/model/services/atendimentoService');
    repoMock.getCountByPeriodo.mockResolvedValue(10);

    const out = await atendimentoService.getAtendimentosCountByYear(2024);

    expect(out).toBe(10);
    expect(repoMock.getCountByPeriodo).toHaveBeenCalledTimes(1);
    const [inicio, fim] = repoMock.getCountByPeriodo.mock.calls[0] as [Date, Date];
    expect(inicio).toEqual(new Date(2024, 0, 1));
    expect(fim).toEqual(new Date(2024, 11, 31, 23, 59, 59));
  });

  it('getAtendimentosByYear: limita o resultado com slice', async () => {
    const { atendimentoService } = await import('@/model/services/atendimentoService');
    repoMock.getByPeriodo.mockResolvedValue([{ id: '1' }, { id: '2' }, { id: '3' }]);

    const out = await atendimentoService.getAtendimentosByYear(2024, 2);

    expect(out).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('criarAtendimento: delega para repository.create', async () => {
    const { atendimentoService } = await import('@/model/services/atendimentoService');
    repoMock.create.mockResolvedValue('new-id');

    const id = await atendimentoService.criarAtendimento({} as any);

    expect(id).toBe('new-id');
    expect(repoMock.create).toHaveBeenCalledTimes(1);
  });
});

