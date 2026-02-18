import { FormularioColaborador } from '@/model/entities';
import { formularioRepository } from '@/model/repositories/formularioRepository';

export class FormularioService {
  
  // Salvar dados do formulário
  async salvarFormulario(userId: string, dados: FormularioColaborador): Promise<void> {
    try {
      await formularioRepository.save(userId, dados);
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      throw new Error('Erro ao salvar dados do formulário');
    }
  }

  // Carregar dados do formulário
  async carregarFormulario(userId: string): Promise<FormularioColaborador | null> {
    try {
      const dados = await formularioRepository.getById(userId);
      return dados;
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
      throw new Error('Erro ao carregar dados do formulário');
    }
  }

  // Validar CPF
  validarCPF(cpf: string): boolean {
    console.log('Validando CPF:', cpf);
    
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    console.log('CPF limpo:', cpfLimpo);

    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      console.log('CPF inválido: não tem 11 dígitos');
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      console.log('CPF inválido: todos os dígitos são iguais');
      return false;
    }

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let dv1 = resto >= 10 ? 0 : resto;

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let dv2 = resto >= 10 ? 0 : resto;

    const isValid = parseInt(cpfLimpo.charAt(9)) === dv1 && parseInt(cpfLimpo.charAt(10)) === dv2;
    console.log('CPF válido:', isValid, { dv1Expected: dv1, dv1Actual: parseInt(cpfLimpo.charAt(9)), dv2Expected: dv2, dv2Actual: parseInt(cpfLimpo.charAt(10)) });
    
    return isValid;
  }

  // Validar CEP
  validarCEP(cep: string): boolean {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    // Verifica se tem 8 dígitos
    return cepLimpo.length === 8;
  }

  // Validar email
  validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar telefone
  validarTelefone(telefone: string): boolean {
    console.log('Validando telefone:', telefone);
    
    // Remove todos os caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '');
    console.log('Telefone limpo:', numeroLimpo);
    
    // Verifica se tem 10 ou 11 dígitos (com DDD)
    const isValid = numeroLimpo.length >= 10 && numeroLimpo.length <= 11;
    console.log('Telefone válido:', isValid);
    
    return isValid;
  }
}

export const formularioService = new FormularioService();
