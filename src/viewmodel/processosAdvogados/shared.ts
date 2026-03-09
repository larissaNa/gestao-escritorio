import { 
  FolderOpen, 
  Gavel, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Banknote, 
  Award, 
  AlertTriangle,
  FileText,
  Users
} from 'lucide-react';
import { StatusProcessoAdvogado, AreaAtuacao, ResultadoAlcancado } from '@/model/entities';
import type { ComponentType } from 'react';

export const statusConfig: Record<
  StatusProcessoAdvogado,
  { color: string; label: string; icon: ComponentType<{ className?: string }>; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "success" | "warning" | "info" }
> = {
  dados_entrada: { color: 'text-gray-500', label: 'Dado entrada', icon: FolderOpen, variant: 'secondary' },
  atendimento: { color: 'text-blue-400', label: 'Atendimento', icon: Users, variant: 'info' },
  audiencia: { color: 'text-blue-500', label: 'Audiência', icon: Gavel, variant: 'default' },
  aguardando_documentacao: { color: 'text-orange-400', label: 'Aguardando documentação', icon: FileText, variant: 'warning' },
  aguardando_retorno_cliente: { color: 'text-yellow-500', label: 'Aguardando retorno', icon: Clock, variant: 'warning' },
  concluso_julgamento: { color: 'text-indigo-500', label: 'Concluso p/ julgamento', icon: Gavel, variant: 'default' },
  procedente: { color: 'text-green-500', label: 'Procedente', icon: CheckCircle2, variant: 'success' },
  improcedente: { color: 'text-red-500', label: 'Improcedente', icon: XCircle, variant: 'destructive' },
  parcialmente_procedente: { color: 'text-yellow-600', label: 'Parcialmente Procedente', icon: CheckCircle2, variant: 'warning' },
  aguardando_pagamento: { color: 'text-orange-500', label: 'Aguardando pagamento', icon: Banknote, variant: 'warning' }
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
