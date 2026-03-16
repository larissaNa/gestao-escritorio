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

vi.mock('@/model/repositories/concessaoRepository', () => ({
  concessaoRepository: repoMock,
}));

describe('concessaoService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('getConcessoesByYear: delega para getByPeriodo com limit', async () => {
    const { concessaoService } = await import('@/model/services/concessaoService');
    repoMock.getByPeriodo.mockResolvedValue([{ id: '1' }]);

    const out = await concessaoService.getConcessoesByYear(2024, 77);

    expect(out).toEqual([{ id: '1' }]);
    const [_inicio, _fim, limit] = repoMock.getByPeriodo.mock.calls[0] as [Date, Date, number];
    expect(limit).toBe(77);
  });

  it('criarConcessao: delega para repository.create', async () => {
    const { concessaoService } = await import('@/model/services/concessaoService');
    repoMock.create.mockResolvedValue('new-id');

    const id = await concessaoService.criarConcessao({} as any);

    expect(id).toBe('new-id');
    expect(repoMock.create).toHaveBeenCalledTimes(1);
  });
});

