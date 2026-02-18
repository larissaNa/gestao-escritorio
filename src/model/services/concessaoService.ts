import { Concessao } from '@/model/entities';
import { concessaoRepository } from '@/model/repositories/concessaoRepository';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

class ConcessaoService {
  async getAllConcessoes(maxDocs = 300): Promise<Concessao[]> {
    return await concessaoRepository.getAll(maxDocs);
  }

  async getConcessoesPaginated(pageSize = 50, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    return await concessaoRepository.getPaginated(pageSize, lastDoc);
  }

  async getConcessoesByTipo(tipo: string): Promise<Concessao[]> {
    return await concessaoRepository.getByTipo(tipo);
  }

  async getConcessoesByPeriodo(inicio: Date, fim: Date, pageSize = 200): Promise<Concessao[]> {
    return await concessaoRepository.getByPeriodo(inicio, fim, pageSize);
  }

  async getConcessoesByYear(year: number, limit = 400): Promise<Concessao[]> {
    const inicio = new Date(year, 0, 1);
    const fim = new Date(year, 11, 31, 23, 59, 59);
    return await this.getConcessoesByPeriodo(inicio, fim, limit);
  }

  async getById(id: string): Promise<Concessao | null> {
    return await concessaoRepository.getById(id);
  }

  async criarConcessao(dados: Omit<Concessao, 'id'>): Promise<string> {
    return await concessaoRepository.create(dados);
  }

  async atualizarConcessao(id: string, dados: Partial<Concessao>): Promise<void> {
    return await concessaoRepository.update(id, dados);
  }

  async excluirConcessao(id: string): Promise<void> {
    return await concessaoRepository.delete(id);
  }
}

export const concessaoService = new ConcessaoService();
