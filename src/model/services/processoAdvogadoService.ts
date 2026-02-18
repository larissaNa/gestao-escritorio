import { ProcessoAdvogado } from '@/model/entities';
import { processoAdvogadoRepository } from '@/model/repositories/processoAdvogadoRepository';

class ProcessoAdvogadoService {
  async list(userUid: string, isAdmin: boolean, pageSize = 200): Promise<ProcessoAdvogado[]> {
    return await processoAdvogadoRepository.list(userUid, isAdmin, pageSize);
  }

  async getById(id: string): Promise<ProcessoAdvogado | null> {
    return await processoAdvogadoRepository.getById(id);
  }

  async create(payload: Omit<ProcessoAdvogado, 'id'>): Promise<string> {
    return await processoAdvogadoRepository.create(payload);
  }

  async update(id: string, payload: Partial<ProcessoAdvogado>): Promise<void> {
    return await processoAdvogadoRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    return await processoAdvogadoRepository.delete(id);
  }

  calcularExito(processos: ProcessoAdvogado[]) {
    let exito = 0;
    let naoExito = 0;

    processos.forEach((proc) => {
      proc.processosEmAndamento?.forEach((p) => {
        if (p.statusProcesso === 'exito') exito += 1;
        if (p.statusProcesso === 'nao_exito') naoExito += 1;
      });
    });

    return { exito, naoExito };
  }
}

export const processoAdvogadoService = new ProcessoAdvogadoService();
