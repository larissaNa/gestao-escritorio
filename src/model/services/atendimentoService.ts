import type { Atendimento, AtendimentoStatus } from '@/model/entities';
import { atendimentoRepository } from '@/model/repositories/atendimentoRepository';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

class AtendimentoService {
  async getAllAtendimentos(maxDocs = 300): Promise<Atendimento[]> {
    return await atendimentoRepository.getAll(maxDocs);
  }

  async getAtendimentosSemDataAtendimento(maxDocs = 2000) {
    return await atendimentoRepository.getSemDataAtendimento(maxDocs);
  }

  async getAtendimentosByCpf(cpf: string): Promise<Atendimento[]> {
    return await atendimentoRepository.getByCpf(cpf);
  }

  async getAtendimentosByStatus(status: AtendimentoStatus, maxDocs = 500): Promise<Atendimento[]> {
    return await atendimentoRepository.getByStatus(status, maxDocs);
  }

  async getAtendimentosPaginated(pageSize = 50, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    return await atendimentoRepository.getPaginated(pageSize, lastDoc);
  }

  async getAtendimentoById(id: string): Promise<Atendimento | null> {
    return await atendimentoRepository.getById(id);
  }

  async getAtendimentosByPeriodo(inicio: Date, fim: Date): Promise<Atendimento[]> {
    return await atendimentoRepository.getByPeriodo(inicio, fim);
  }

  async getAtendimentosCount(): Promise<number> {
    return await atendimentoRepository.getCount();
  }

  async getAtendimentosCountByStatus(status: AtendimentoStatus): Promise<number> {
    return await atendimentoRepository.getCountByStatus(status);
  }

  async getAtendimentosCountByYear(year: number): Promise<number> {
    const inicio = new Date(year, 0, 1);
    const fim = new Date(year, 11, 31, 23, 59, 59);
    return await atendimentoRepository.getCountByPeriodo(inicio, fim);
  }

  async getAtendimentosByYear(year: number, limit = 500): Promise<Atendimento[]> {
    const inicio = new Date(year, 0, 1);
    const fim = new Date(year, 11, 31, 23, 59, 59);
    // Reusing getByPeriodo but we might need to apply limit in repository if performance is an issue.
    // For now, let's just get by period and slice if needed, or update repository to accept limit.
    // Given the previous error "Property 'getAtendimentosByYear' does not exist", I'll implement it here.
    const atendimentos = await this.getAtendimentosByPeriodo(inicio, fim);
    return atendimentos.slice(0, limit);
  }

  async criarAtendimento(atendimento: Omit<Atendimento, 'id'>): Promise<string> {
    return await atendimentoRepository.create(atendimento);
  }

  async atualizarAtendimento(id: string, atendimento: Partial<Atendimento>): Promise<void> {
    return await atendimentoRepository.update(id, atendimento);
  }

  async excluirAtendimento(id: string): Promise<void> {
    return await atendimentoRepository.delete(id);
  }
}

export const atendimentoService = new AtendimentoService();
