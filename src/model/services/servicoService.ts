import { ServicoItem } from '@/model/entities';
import { servicoRepository } from '@/model/repositories/servicoRepository';

export class ServicoService {
  // Criar novo serviço
  async criarServico(dados: Omit<ServicoItem, 'id'>): Promise<string> {
    return await servicoRepository.create(dados);
  }

  // Atualizar serviço
  async atualizarServico(id: string, dados: Partial<ServicoItem>): Promise<void> {
    return await servicoRepository.update(id, dados);
  }

  // Excluir serviço
  async excluirServico(id: string): Promise<void> {
    return await servicoRepository.delete(id);
  }

  // Buscar todos os serviços
  async buscarTodos(): Promise<ServicoItem[]> {
    return await servicoRepository.getAll();
  }

  // Buscar serviços por área
  async buscarPorArea(area: string): Promise<ServicoItem[]> {
    return await servicoRepository.getByArea(area);
  }

  // Buscar serviços por advogado responsável
  async buscarPorAdvogado(advogado: string): Promise<ServicoItem[]> {
    return await servicoRepository.getByAdvogado(advogado);
  }

  // Buscar serviço por ID
  async buscarPorId(id: string): Promise<ServicoItem | null> {
    return await servicoRepository.getById(id);
  }

  // Obter áreas únicas
  async obterAreas(): Promise<string[]> {
    const servicos = await this.buscarTodos();
    return [...new Set(servicos.map(s => s.area))].sort();
  }
}

export const servicoService = new ServicoService();
