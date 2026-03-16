import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    save: vi.fn(),
    getById: vi.fn(),
  };
});

vi.mock('@/model/repositories/formularioRepository', () => ({
  formularioRepository: repoMock,
}));

describe('FormularioService', () => {
  beforeEach(() => {
    repoMock.save.mockReset();
    repoMock.getById.mockReset();
  });

  it('salvarFormulario: chama repository.save no sucesso', async () => {
    const { FormularioService } = await import('@/model/services/formularioService');
    const service = new FormularioService();

    repoMock.save.mockResolvedValue(undefined);

    await service.salvarFormulario('u1', { primeiroNome: 'A' } as any);

    expect(repoMock.save).toHaveBeenCalledWith('u1', { primeiroNome: 'A' });
  });

  it('salvarFormulario: lança erro padronizado quando repository falha', async () => {
    const { FormularioService } = await import('@/model/services/formularioService');
    const service = new FormularioService();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    repoMock.save.mockRejectedValue(new Error('boom'));

    await expect(service.salvarFormulario('u1', {} as any)).rejects.toThrow('Erro ao salvar dados do formulário');
  });

  it('carregarFormulario: retorna null quando repository retorna null', async () => {
    const { FormularioService } = await import('@/model/services/formularioService');
    const service = new FormularioService();

    repoMock.getById.mockResolvedValue(null);

    const out = await service.carregarFormulario('u1');

    expect(out).toBeNull();
  });

  it('carregarFormulario: lança erro padronizado quando repository falha', async () => {
    const { FormularioService } = await import('@/model/services/formularioService');
    const service = new FormularioService();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    repoMock.getById.mockRejectedValue(new Error('boom'));

    await expect(service.carregarFormulario('u1')).rejects.toThrow('Erro ao carregar dados do formulário');
  });

  it('validarCPF: valida CPFs válidos e rejeita inválidos', async () => {
    const { FormularioService } = await import('@/model/services/formularioService');
    const service = new FormularioService();

    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    expect(service.validarCPF('529.982.247-25')).toBe(true);
    expect(service.validarCPF('111.111.111-11')).toBe(false);
    expect(service.validarCPF('123')).toBe(false);
    expect(service.validarCPF('52998224724')).toBe(false);
  });

  it('validarCEP: aceita apenas 8 dígitos após limpeza', async () => {
    const { FormularioService } = await import('@/model/services/formularioService');
    const service = new FormularioService();

    expect(service.validarCEP('30110-000')).toBe(true);
    expect(service.validarCEP('123')).toBe(false);
  });

  it('validarEmail: aplica regex básico', async () => {
    const { FormularioService } = await import('@/model/services/formularioService');
    const service = new FormularioService();

    expect(service.validarEmail('a@b.com')).toBe(true);
    expect(service.validarEmail('a@b')).toBe(false);
    expect(service.validarEmail('a.com')).toBe(false);
  });

  it('validarTelefone: aceita 10 ou 11 dígitos após limpeza', async () => {
    const { FormularioService } = await import('@/model/services/formularioService');
    const service = new FormularioService();

    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    expect(service.validarTelefone('(31) 99999-9999')).toBe(true);
    expect(service.validarTelefone('(31) 9999-9999')).toBe(true);
    expect(service.validarTelefone('999')).toBe(false);
  });
});

