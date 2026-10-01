import { describe, it, expect, vi, beforeEach } from 'vitest';
import { relatorioDiarioRepository } from '@/model/repositories/relatorioDiarioRepository';
import { relatorioDiarioService } from '@/model/services/relatorioDiarioService';

vi.mock('@/model/repositories/relatorioDiarioRepository', () => ({
  relatorioDiarioRepository: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    getByResponsavel: vi.fn(),
  },
}));

describe('RelatorioDiarioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('criar: chama repository.create', async () => {
    vi.mocked(relatorioDiarioRepository.create).mockResolvedValue('novo-id');
    const input = {
      responsavelId: 'user-1',
      responsavelNome: 'Lucas',
      data: new Date(),
      descricao: 'Atividades do dia',
    };

    const res = await relatorioDiarioService.criar(input);
    expect(res).toBe('novo-id');
    expect(relatorioDiarioRepository.create).toHaveBeenCalledWith(input);
  });

  it('atualizar: chama repository.update', async () => {
    vi.mocked(relatorioDiarioRepository.update).mockResolvedValue(undefined);
    await relatorioDiarioService.atualizar('id-1', { descricao: 'Atualizado' });
    expect(relatorioDiarioRepository.update).toHaveBeenCalledWith('id-1', { descricao: 'Atualizado' });
  });

  it('excluir: chama repository.delete', async () => {
    vi.mocked(relatorioDiarioRepository.delete).mockResolvedValue(undefined);
    await relatorioDiarioService.excluir('id-1');
    expect(relatorioDiarioRepository.delete).toHaveBeenCalledWith('id-1');
  });

  it('buscarTodos: chama repository.getAll', async () => {
    vi.mocked(relatorioDiarioRepository.getAll).mockResolvedValue([]);
    const res = await relatorioDiarioService.buscarTodos();
    expect(res).toEqual([]);
    expect(relatorioDiarioRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('buscarPorResponsavel: chama repository.getByResponsavel', async () => {
    vi.mocked(relatorioDiarioRepository.getByResponsavel).mockResolvedValue([]);
    const res = await relatorioDiarioService.buscarPorResponsavel('user-1');
    expect(res).toEqual([]);
    expect(relatorioDiarioRepository.getByResponsavel).toHaveBeenCalledWith('user-1');
  });
});
