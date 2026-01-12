import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { FormularioColaborador } from '@/types';

export class FormularioService {
  private collectionName = 'colaboradores';

  // Salvar dados do formulário
  async salvarFormulario(userId: string, dados: FormularioColaborador): Promise<void> {
    try {
      // Preparar dados para salvar (remover campos undefined)
      const dadosParaSalvar: any = {
        ...dados,
        dataAtualizacao: new Date()
      };

      // Salvar dados no Firestore
      await setDoc(doc(db, this.collectionName, userId), dadosParaSalvar);
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      throw new Error('Erro ao salvar dados do formulário');
    }
  }

  // Carregar dados do formulário
  async carregarFormulario(userId: string): Promise<FormularioColaborador | null> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as FormularioColaborador;
      }

      return null;
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
    
    // Verifica se tem 10 ou 11 dígitos (com ou sem 9 no celular)
    if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
      console.log('Telefone inválido: deve ter 10 ou 11 dígitos, tem:', numeroLimpo.length);
      return false;
    }
    
    // Verifica se o DDD é válido (11-99)
    const ddd = parseInt(numeroLimpo.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      console.log('Telefone inválido: DDD inválido:', ddd);
      return false;
    }
    
    // Para números com 11 dígitos (celular), o terceiro dígito deve ser 9
    if (numeroLimpo.length === 11) {
      const terceiroDigito = parseInt(numeroLimpo.charAt(2));
      if (terceiroDigito !== 9) {
        console.log('Celular inválido: terceiro dígito deve ser 9, é:', terceiroDigito);
        return false;
      }
      
      // O quarto dígito deve ser entre 6-9
      const quartoDigito = parseInt(numeroLimpo.charAt(3));
      if (quartoDigito < 6 || quartoDigito > 9) {
        console.log('Celular inválido: quarto dígito deve ser 6-9, é:', quartoDigito);
        return false;
      }
    } else {
      // Para números com 10 dígitos (fixo), o terceiro dígito deve ser 2-5
      const terceiroDigito = parseInt(numeroLimpo.charAt(2));
      if (terceiroDigito < 2 || terceiroDigito > 5) {
        console.log('Fixo inválido: terceiro dígito deve ser 2-5, é:', terceiroDigito);
        return false;
      }
    }
    
    console.log('Telefone válido');
    return true;
  }

  // Validar CEP
  validarCEP(cep: string): boolean {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
  }
}

export const formularioService = new FormularioService();
