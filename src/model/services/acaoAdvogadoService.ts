import { AcaoAdvogado } from '@/model/entities';
import { acaoAdvogadoRepository } from '@/model/repositories/acaoAdvogadoRepository';

export class AcaoAdvogadoService {
  buscarAreas(): any {
    throw new Error('Method not implemented.');
  }
  async criarAcao(dados: Omit<AcaoAdvogado, 'id' | 'dataCadastro'>): Promise<string> {
    return await acaoAdvogadoRepository.create(dados);
  }

  async atualizarAcao(id: string, dados: Partial<AcaoAdvogado>): Promise<void> {
    return await acaoAdvogadoRepository.update(id, dados);
  }

  async excluirAcao(id: string): Promise<void> {
    return await acaoAdvogadoRepository.delete(id);
  }

  async buscarPorId(id: string): Promise<AcaoAdvogado | null> {
    return await acaoAdvogadoRepository.getById(id);
  }

  async buscarTodos(): Promise<AcaoAdvogado[]> {
    return await acaoAdvogadoRepository.getAll();
  }

  async buscarComFiltros(filtros: {
    advogado?: string;
    area?: string;
    situacao?: string;
  }): Promise<AcaoAdvogado[]> {
    return await acaoAdvogadoRepository.getByFilters(filtros);
  }
}

export const acaoAdvogadoService = new AcaoAdvogadoService();
