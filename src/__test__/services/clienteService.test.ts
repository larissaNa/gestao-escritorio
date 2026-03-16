import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    getAll: vi.fn(),
    getAllOrderedByName: vi.fn(),
    getByCpf: vi.fn(),
    getByPartialCpf: vi.fn(),
    getByNome: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
});

vi.mock('@/model/repositories/clienteRepository', () => ({
  clienteRepository: repoMock,
}));

describe('clienteService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('getAllClientes: retorna dados no sucesso', async () => {
    const { clienteService } = await import('@/model/services/clienteService');
    repoMock.getAll.mockResolvedValue([{ id: '1' }]);

    const out = await clienteService.getAllClientes();

    expect(out).toEqual([{ id: '1' }]);
    expect(repoMock.getAll).toHaveBeenCalledTimes(1);
  });

  it('getClienteByCpf: relança erro quando repository falha', async () => {
    const { clienteService } = await import('@/model/services/clienteService');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    repoMock.getByCpf.mockRejectedValue(new Error('boom'));

    await expect(clienteService.getClienteByCpf('123')).rejects.toThrow('boom');
  });

  it('updateCliente: delega para repository.update', async () => {
    const { clienteService } = await import('@/model/services/clienteService');
    repoMock.update.mockResolvedValue(undefined);

    await clienteService.updateCliente('id-1', { nome: 'N' } as any);

    expect(repoMock.update).toHaveBeenCalledWith('id-1', { nome: 'N' });
  });
});

