import { 
  FolderOpen, 
  Gavel, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Banknote, 
  Award, 
  AlertTriangle 
} from 'lucide-react';
import { StatusProcessoAdvogado, AreaAtuacao, ResultadoAlcancado } from '@/model/entities';

export const statusConfig: Record<
  StatusProcessoAdvogado,
  { color: string; label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "success" | "warning" | "info" }
> = {
  dados_entrada: { color: 'text-gray-500', label: 'Dados de entrada', icon: FolderOpen, variant: 'secondary' },
  audiencia: { color: 'text-blue-500', label: 'Audiência', icon: Gavel, variant: 'default' },
  aguardando_retorno_cliente: { color: 'text-yellow-500', label: 'Aguardando retorno', icon: Clock, variant: 'warning' },
  concluso_julgamento: { color: 'text-indigo-500', label: 'Concluso p/ julgamento', icon: Gavel, variant: 'default' },
  procedente: { color: 'text-green-500', label: 'Procedente', icon: CheckCircle2, variant: 'success' },
  improcedente: { color: 'text-red-500', label: 'Improcedente', icon: XCircle, variant: 'destructive' },
  aguardando_pagamento: { color: 'text-orange-500', label: 'Aguardando pagamento', icon: Banknote, variant: 'warning' },
  exito: { color: 'text-green-600', label: 'Êxito', icon: Award, variant: 'success' },
  nao_exito: { color: 'text-gray-500', label: 'Não êxito', icon: AlertTriangle, variant: 'secondary' }
};

export const areasAtuacao: AreaAtuacao[] = [
  'Previdenciário',
  'Cível',
  'Criminal',
  'Bancário',
  'Família',
  'Consumidor',
  'Tributário',
  'Imobiliário',
  'Trabalhista'
];

export const resultadosAlcancados: ResultadoAlcancado[] = [
  'Procedente',
  'Improcedente',
  'Parcialmente Procedente',
  'Acordo'
];
