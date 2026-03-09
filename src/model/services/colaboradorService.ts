import { colaboradorRepository, ColaboradorData } from '@/model/repositories/colaboradorRepository';

export type { ColaboradorData };

export class ColaboradorService {
  async deleteColaborador(id: string): Promise<void> {
    try {
      await colaboradorRepository.delete(id);
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error);
      throw error;
    }
  }
  // Buscar colaborador por ID do usuário
  async getColaboradorByUserId(userId: string): Promise<ColaboradorData | null> {
    try {
      return await colaboradorRepository.getById(userId);
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      throw error;
    }
  }

  // Buscar todos os colaboradores (apenas para admins)
  async getAllColaboradores(): Promise<ColaboradorData[]> {
    try {
      return await colaboradorRepository.getAll();
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      throw error;
    }
  }

  // Buscar colaboradores por role
  async getColaboradoresByRole(role: string): Promise<ColaboradorData[]> {
    try {
      return await colaboradorRepository.getByRole(role);
    } catch (error) {
      console.error('Erro ao buscar colaboradores por role:', error);
      throw error;
    }
  }

  // Verificar se colaborador preencheu o formulário
  async hasFilledForm(userId: string): Promise<boolean> {
    try {
      const colaborador = await this.getColaboradorByUserId(userId);
      if (!colaborador) return false;

      // Verificar se os campos obrigatórios estão preenchidos
      const camposObrigatorios = [
        'primeiroNome',
        'sobreNome',
        'cpf',
        'funcaoCargo',
        'departamento'
      ];

      return camposObrigatorios.every(campo => 
        colaborador[campo as keyof ColaboradorData] && 
        String(colaborador[campo as keyof ColaboradorData]).trim() !== ''
      );
    } catch (error) {
      console.error('Erro ao verificar formulário:', error);
      return false;
    }
  }

  async getNomeCompleto(userId: string): Promise<string> {
    try {
      const colaborador = await this.getColaboradorByUserId(userId);
      if (!colaborador) return '';
      return `${colaborador.primeiroNome || ''} ${colaborador.sobreNome || ''}`.trim();
    } catch (error) {
      console.error('Erro ao buscar nome completo:', error);
      return '';
    }
  }

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const colaborador = await this.getColaboradorByUserId(userId);
      return colaborador?.role === 'admin';
    } catch (error) {
      console.error('Erro ao verificar se é admin:', error);
      return false;
    }
  }
}

export const colaboradorService = new ColaboradorService();
