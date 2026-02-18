import { IdaBanco } from '@/model/entities';
import { idasBancoRepository } from '@/model/repositories/idasBancoRepository';

export const idasBancoService = {
  // Adicionar nova ida ao banco
  addIda: async (ida: Omit<IdaBanco, 'id' | 'createdAt'>): Promise<string> => {
    try {
      return await idasBancoRepository.add(ida);
    } catch (error) {
      console.error('Erro ao adicionar ida ao banco:', error);
      throw error;
    }
  },

  // Buscar todas as idas
  getIdas: async (): Promise<IdaBanco[]> => {
    try {
      return await idasBancoRepository.getAll();
    } catch (error) {
      console.error('Erro ao buscar idas ao banco:', error);
      throw error;
    }
  },

  // Buscar ida por ID
  getIdaById: async (id: string): Promise<IdaBanco | null> => {
    try {
      return await idasBancoRepository.getById(id);
    } catch (error) {
      console.error('Erro ao buscar ida ao banco por ID:', error);
      throw error;
    }
  },

  // Contar idas de um cliente específico
  countIdasCliente: async (clienteNome: string): Promise<number> => {
    try {
      return await idasBancoRepository.countByCliente(clienteNome);
    } catch (error) {
      console.error('Erro ao contar idas do cliente:', error);
      return 0;
    }
  },

  // Excluir uma ida
  deleteIda: async (id: string): Promise<void> => {
    try {
      await idasBancoRepository.delete(id);
    } catch (error) {
      console.error('Erro ao excluir ida ao banco:', error);
      throw error;
    }
  },

  // Atualizar uma ida
  updateIda: async (id: string, ida: Partial<IdaBanco>): Promise<void> => {
    try {
      await idasBancoRepository.update(id, ida);
    } catch (error) {
      console.error('Erro ao atualizar ida ao banco:', error);
      throw error;
    }
  }
};
