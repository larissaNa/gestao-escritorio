import { RelatorioItem } from '@/model/entities';
import { relatorioRepository } from '@/model/repositories/relatorioRepository';

export class RelatorioService {
  // Criar novo relatório
  async criarRelatorio(dados: Omit<RelatorioItem, 'id' | 'data' | 'mes'>): Promise<string> {
    return await relatorioRepository.create(dados);
  }

  // Atualizar relatório
  async atualizarRelatorio(id: string, dados: Partial<RelatorioItem>): Promise<void> {
    return await relatorioRepository.update(id, dados);
  }

  // Excluir relatório
  async excluirRelatorio(id: string): Promise<void> {
    return await relatorioRepository.delete(id);
  }

  // Buscar relatório por ID
  async getById(id: string): Promise<RelatorioItem | null> {
    return await relatorioRepository.getById(id);
  }

  // Buscar todos os relatórios
  async buscarTodos(): Promise<RelatorioItem[]> {
    return await relatorioRepository.getAll();
  }

  // Buscar relatórios por responsável
  async buscarPorResponsavel(responsavel: string): Promise<RelatorioItem[]> {
    return await relatorioRepository.getByResponsavel(responsavel);
  }

  // Buscar relatórios por tipo de ação
  async buscarPorTipoAcao(tipoAcao: string): Promise<RelatorioItem[]> {
    return await relatorioRepository.getByTipoAcao(tipoAcao);
  }

  // Buscar relatórios por setor
  async buscarPorSetor(setor: string): Promise<RelatorioItem[]> {
    return await relatorioRepository.getBySetor(setor);
  }
}

export const relatorioService = new RelatorioService();
