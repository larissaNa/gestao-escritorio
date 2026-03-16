import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock('firebase/firestore', () => ({
  QueryDocumentSnapshot: class {},
  DocumentData: class {},
}));

const repoMock = vi.hoisted(() => {
  return {
    getAll: vi.fn(),
    getPaginated: vi.fn(),
    getByTipo: vi.fn(),
    getByPeriodo: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
});

vi.mock('@/model/repositories/beneficioRepository', () => ({
  beneficioRepository: repoMock,
}));

describe('beneficioService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('getBeneficiosByYear: chama getByPeriodo com período do ano e limit', async () => {
    const { beneficioService } = await import('@/model/services/beneficioService');
    repoMock.getByPeriodo.mockResolvedValue([{ id: '1' }]);

    const out = await beneficioService.getBeneficiosByYear(2024, 123);

    expect(out).toEqual([{ id: '1' }]);
    expect(repoMock.getByPeriodo).toHaveBeenCalledTimes(1);
    const [_inicio, _fim, limit] = repoMock.getByPeriodo.mock.calls[0] as [Date, Date, number];
    expect(limit).toBe(123);
  });

  it('criarBeneficio: delega para repository.create', async () => {
    const { beneficioService } = await import('@/model/services/beneficioService');
    repoMock.create.mockResolvedValue('new-id');

    const id = await beneficioService.criarBeneficio({} as any);

    expect(id).toBe('new-id');
    expect(repoMock.create).toHaveBeenCalledTimes(1);
  });
});

