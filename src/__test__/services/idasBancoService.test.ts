import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    add: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    countByCliente: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  };
});

vi.mock('@/model/repositories/idasBancoRepository', () => ({
  idasBancoRepository: repoMock,
}));

describe('idasBancoService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('addIda: retorna id no sucesso e verifica interação', async () => {
    const { idasBancoService } = await import('@/model/services/idasBancoService');
    repoMock.add.mockResolvedValue('new-id');

    const id = await idasBancoService.addIda({ clienteNome: 'C' } as any);

    expect(id).toBe('new-id');
    expect(repoMock.add).toHaveBeenCalledWith({ clienteNome: 'C' });
  });

  it('addIda: relança erro quando repository falha', async () => {
    const { idasBancoService } = await import('@/model/services/idasBancoService');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    repoMock.add.mockRejectedValue(new Error('boom'));

    await expect(idasBancoService.addIda({} as any)).rejects.toThrow('boom');
  });

  it('countIdasCliente: retorna 0 quando repository falha', async () => {
    const { idasBancoService } = await import('@/model/services/idasBancoService');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    repoMock.countByCliente.mockRejectedValue(new Error('boom'));

    const out = await idasBancoService.countIdasCliente('C');

    expect(out).toBe(0);
  });
});

