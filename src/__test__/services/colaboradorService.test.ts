import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    delete: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    getByRole: vi.fn(),
  };
});

vi.mock('@/model/repositories/colaboradorRepository', () => ({
  colaboradorRepository: repoMock,
}));

describe('ColaboradorService', () => {
  beforeEach(() => {
    repoMock.delete.mockReset();
    repoMock.getById.mockReset();
    repoMock.getAll.mockReset();
    repoMock.getByRole.mockReset();
  });

  it('hasFilledForm: retorna false quando colaborador não existe', async () => {
    const { ColaboradorService } = await import('@/model/services/colaboradorService');
    const service = new ColaboradorService();

    repoMock.getById.mockResolvedValue(null);

    const out = await service.hasFilledForm('u1');

    expect(out).toBe(false);
  });

  it('hasFilledForm: valida campos obrigatórios e retorna true quando completos', async () => {
    const { ColaboradorService } = await import('@/model/services/colaboradorService');
    const service = new ColaboradorService();

    repoMock.getById.mockResolvedValue({
      primeiroNome: 'A',
      sobreNome: 'B',
      cpf: '123',
      funcaoCargo: 'X',
      departamento: 'Y',
    });

    const out = await service.hasFilledForm('u1');

    expect(out).toBe(true);
  });

  it('hasFilledForm: retorna false quando algum campo obrigatório está vazio', async () => {
    const { ColaboradorService } = await import('@/model/services/colaboradorService');
    const service = new ColaboradorService();

    repoMock.getById.mockResolvedValue({
      primeiroNome: 'A',
      sobreNome: ' ',
      cpf: '123',
      funcaoCargo: 'X',
      departamento: 'Y',
    });

    const out = await service.hasFilledForm('u1');

    expect(out).toBe(false);
  });

  it('hasFilledForm: retorna false quando repository lança erro', async () => {
    const { ColaboradorService } = await import('@/model/services/colaboradorService');
    const service = new ColaboradorService();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    repoMock.getById.mockRejectedValue(new Error('boom'));

    const out = await service.hasFilledForm('u1');

    expect(out).toBe(false);
  });

  it('getNomeCompleto: concatena e faz trim', async () => {
    const { ColaboradorService } = await import('@/model/services/colaboradorService');
    const service = new ColaboradorService();

    repoMock.getById.mockResolvedValue({ primeiroNome: 'A', sobreNome: 'B' });

    const out = await service.getNomeCompleto('u1');

    expect(out).toBe('A B');
  });

  it('isAdmin: retorna true quando role é admin', async () => {
    const { ColaboradorService } = await import('@/model/services/colaboradorService');
    const service = new ColaboradorService();

    repoMock.getById.mockResolvedValue({ role: 'admin' });

    const out = await service.isAdmin('u1');

    expect(out).toBe(true);
  });
});

