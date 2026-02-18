import { BeneficioItem } from '@/model/entities';
import { beneficioRepository } from '@/model/repositories/beneficioRepository';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

class BeneficioService {
  async getAllBeneficios(maxDocs = 300): Promise<BeneficioItem[]> {
    return await beneficioRepository.getAll(maxDocs);
  }

  async getBeneficiosPaginated(pageSize = 50, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    return await beneficioRepository.getPaginated(pageSize, lastDoc);
  }

  async getBeneficiosByTipo(tipo: string): Promise<BeneficioItem[]> {
    return await beneficioRepository.getByTipo(tipo);
  }

  async getBeneficiosByPeriodo(inicio: Date, fim: Date, pageSize = 200, lastDoc?: any): Promise<BeneficioItem[]> {
    return await beneficioRepository.getByPeriodo(inicio, fim, pageSize);
  }

  async getBeneficiosByYear(year: number, limit = 400): Promise<BeneficioItem[]> {
    const inicio = new Date(year, 0, 1);
    const fim = new Date(year, 11, 31, 23, 59, 59);
    return await this.getBeneficiosByPeriodo(inicio, fim, limit);
  }

  async getById(id: string): Promise<BeneficioItem | null> {
    return await beneficioRepository.getById(id);
  }

  async criarBeneficio(dados: Omit<BeneficioItem, 'id' | 'ativo' | 'dataCriacao'>): Promise<string> {
    return await beneficioRepository.create(dados);
  }

  async atualizarBeneficio(id: string, dados: Partial<BeneficioItem>): Promise<void> {
    return await beneficioRepository.update(id, dados);
  }

  async excluirBeneficio(id: string): Promise<void> {
    return await beneficioRepository.delete(id);
  }
}

export const beneficioService = new BeneficioService();
