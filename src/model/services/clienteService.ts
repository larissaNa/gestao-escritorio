import { Cliente } from '@/model/entities';
import { clienteRepository } from '@/model/repositories/clienteRepository';

class ClienteService {
  async getAllClientes(): Promise<Cliente[]> {
    try {
      return await clienteRepository.getAll();
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  async getAllClientesOrderedByName(limit = 50): Promise<Cliente[]> {
    try {
      return await clienteRepository.getAllOrderedByName(limit);
    } catch (error) {
      console.error('Erro ao buscar clientes ordenados:', error);
      throw error;
    }
  }

  async getClienteByCpf(cpf: string): Promise<Cliente | null> {
    try {
      return await clienteRepository.getByCpf(cpf);
    } catch (error) {
      console.error('Erro ao buscar cliente por CPF:', error);
      throw error;
    }
  }

  async getClientesByPartialCpf(cpfPrefix: string): Promise<Cliente[]> {
    try {
      return await clienteRepository.getByPartialCpf(cpfPrefix);
    } catch (error) {
      console.error('Erro ao buscar clientes por CPF parcial:', error);
      throw error;
    }
  }

  async getClienteByNome(nome: string, limit = 20): Promise<Cliente[]> {
    try {
      return await clienteRepository.getByNome(nome, limit);
    } catch (error) {
      console.error('Erro ao buscar cliente por nome:', error);
      throw error;
    }
  }

  async getClienteById(id: string): Promise<Cliente | null> {
    try {
      return await clienteRepository.getById(id);
    } catch (error) {
      console.error('Erro ao buscar cliente por id:', error);
      throw error;
    }
  }

  async createCliente(cliente: Omit<Cliente, 'id'>): Promise<string> {
    try {
      return await clienteRepository.create(cliente);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<void> {
    try {
      return await clienteRepository.update(id, cliente);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }
}

export const clienteService = new ClienteService();
