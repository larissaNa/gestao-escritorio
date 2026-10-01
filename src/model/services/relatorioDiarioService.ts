import { RelatorioDiarioItem } from '@/model/entities';
import { relatorioDiarioRepository } from '@/model/repositories/relatorioDiarioRepository';

export class RelatorioDiarioService {
  async criar(dados: Omit<RelatorioDiarioItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await relatorioDiarioRepository.create(dados);
  }

  async atualizar(id: string, dados: Partial<RelatorioDiarioItem>): Promise<void> {
    return await relatorioDiarioRepository.update(id, dados);
  }

  async excluir(id: string): Promise<void> {
    return await relatorioDiarioRepository.delete(id);
  }

  async getById(id: string): Promise<RelatorioDiarioItem | null> {
    return await relatorioDiarioRepository.getById(id);
  }

  async buscarTodos(): Promise<RelatorioDiarioItem[]> {
    return await relatorioDiarioRepository.getAll();
  }

  async buscarPorResponsavel(responsavelId: string): Promise<RelatorioDiarioItem[]> {
    return await relatorioDiarioRepository.getByResponsavel(responsavelId);
  }
}

export const relatorioDiarioService = new RelatorioDiarioService();
