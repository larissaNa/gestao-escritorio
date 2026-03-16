import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    addCusto: vi.fn(),
    getReceitas: vi.fn(),
    addReceita: vi.fn(),
    updateReceita: vi.fn(),
    deleteReceita: vi.fn(),
    getCustos: vi.fn(),
    updateCusto: vi.fn(),
    deleteCusto: vi.fn(),
  };
});

vi.mock('@/model/repositories/financeiroRepository', () => ({
  financeiroRepository: repoMock,
}));

describe('FinanceiroService', () => {
  beforeEach(() => {
    Object.values(repoMock).forEach((fn) => (fn as any).mockReset?.());
  });

  it('calculateResumo: calcula totais e resultado líquido', async () => {
    const { FinanceiroService } = await import('@/model/services/financeiro.service');
    const service = new FinanceiroService();

    const resumo = service.calculateResumo(
      [
        { valorTotal: 100, valorPago: 40, valorAberto: 60 } as any,
        { valorTotal: 50, valorPago: 50, valorAberto: 0 } as any,
      ],
      [{ valor: 30 } as any],
    );

    expect(resumo).toEqual({
      receitaTotal: 150,
      receitaRecebida: 90,
      receitaPendente: 60,
      custosTotais: 30,
      resultadoLiquido: 60,
    });
  });

  it('getReceitas: retorna [] quando repository falha', async () => {
    const { FinanceiroService } = await import('@/model/services/financeiro.service');
    const service = new FinanceiroService();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    repoMock.getReceitas.mockRejectedValue(new Error('boom'));

    const out = await service.getReceitas('u1', { escritorio: 'X' });

    expect(out).toEqual([]);
  });

  it('addCusto: relança erro quando repository falha', async () => {
    const { FinanceiroService } = await import('@/model/services/financeiro.service');
    const service = new FinanceiroService();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    repoMock.addCusto.mockRejectedValue(new Error('boom'));

    await expect(service.addCusto({} as any)).rejects.toThrow('boom');
  });

  it('updateReceita: chama repository com args corretos', async () => {
    const { FinanceiroService } = await import('@/model/services/financeiro.service');
    const service = new FinanceiroService();

    repoMock.updateReceita.mockResolvedValue(undefined);

    await service.updateReceita('r1', { status: 'ok' } as any);

    expect(repoMock.updateReceita).toHaveBeenCalledWith('r1', { status: 'ok' });
  });
});

