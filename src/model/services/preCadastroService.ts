import { PreCadastro } from '@/model/entities';
import { preCadastroRepository } from '@/model/repositories/preCadastroRepository';

export class PreCadastroService {
  // Criar novo pré-cadastro
  async criarPreCadastro(dados: Omit<PreCadastro, 'id' | 'dataCadastro'>): Promise<string> {
    return await preCadastroRepository.create(dados);
  }

  // Atualizar status do pré-cadastro
  async atualizarStatus(id: string, status: PreCadastro['status']): Promise<void> {
    return await preCadastroRepository.updateStatus(id, status);
  }

  // Buscar todos os pré-cadastros
  async buscarTodos(): Promise<PreCadastro[]> {
    return await preCadastroRepository.getAll();
  }

  // Buscar pré-cadastros por status
  async buscarPorStatus(status: PreCadastro['status']): Promise<PreCadastro[]> {
    return await preCadastroRepository.getByStatus(status);
  }

  // Buscar pré-cadastros por responsável
  async buscarPorResponsavel(responsavel: string): Promise<PreCadastro[]> {
    return await preCadastroRepository.getByResponsavel(responsavel);
  }

  // Buscar pré-cadastros aguardando
  async buscarAguardando(): Promise<PreCadastro[]> {
    return this.buscarPorStatus('aguardando');
  }

  // Contar pré-cadastros por status
  async contarPorStatus(): Promise<{ aguardando: number; em_atendimento: number; finalizado: number }> {
    const [aguardando, emAtendimento, finalizado] = await Promise.all([
      this.buscarPorStatus('aguardando'),
      this.buscarPorStatus('em_atendimento'),
      this.buscarPorStatus('finalizado')
    ]);

    return {
      aguardando: aguardando.length,
      em_atendimento: emAtendimento.length,
      finalizado: finalizado.length
    };
  }
}

export const preCadastroService = new PreCadastroService();
