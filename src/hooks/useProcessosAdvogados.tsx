import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { processoAdvogadoService } from '@/services/processoAdvogadoService';
import { 
  ProcessoAdvogado, 
  ProcessoEmAndamento, 
  StatusProcessoAdvogado,
  AreaAtuacao,
  ResultadoAlcancado
} from '@/types';
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
import { toast } from '@/hooks/use-toast';

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

const emptyProcesso: ProcessoAdvogado = {
  uidAdvogado: '',
  nomeAdvogado: '',
  tipoParceria: 'advogado',
  areaAtuacao: 'Cível',
  processosEmAndamento: [],
  resultadosAlcancados: 'Procedente',
  honorariosRecebidos: 0,
  honorariosRepassados: 0,
  dataUltimaAtualizacao: new Date(),
  ativo: true
};

export const useProcessosAdvogados = () => {
  const { user, isAdmin } = useAuth();
  const [processos, setProcessos] = useState<ProcessoAdvogado[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<ProcessoAdvogado>(emptyProcesso);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');

  useEffect(() => {
    if (user) {
      carregar();
    }
  }, [user]);

  const carregar = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await processoAdvogadoService.list(user.uid, isAdmin);
      // Filter logic is applied in memory for simplicity unless dataset is huge
      // But we also need to respect "user can only see their own" logic which is handled by service/firestore rules ideally
      // The user requested "cada um pode ver apenas o seu registro".
      // If isAdmin is true, maybe they see all? The service.list handles that based on isAdmin flag.
      // If the user meant even admins should filter, we'd adjust. Assuming standard role based access:
      // Admins see all, regular users see only theirs. The service already does:
      // list(userUid, isAdmin) -> if isAdmin query all, else query by uidAdvogado.
      
      setProcessos(data);
    } catch (err) {
      console.error('Erro ao carregar processos de advogados', err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNovo = () => {
    setSelected({
      ...emptyProcesso,
      uidAdvogado: user?.uid || '',
      nomeAdvogado: user?.displayName || '',
      dataUltimaAtualizacao: new Date()
    });
    setShowModal(true);
  };

  const abrirEdicao = (proc: ProcessoAdvogado) => {
    setSelected({ ...proc, processosEmAndamento: proc.processosEmAndamento || [] });
    setShowModal(true);
  };

  const salvar = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        ...selected,
        dataUltimaAtualizacao: new Date()
      } as ProcessoAdvogado;

      if (selected.id) {
        await processoAdvogadoService.update(selected.id, payload);
      } else {
        await processoAdvogadoService.create({ ...payload, uidAdvogado: user.uid });
      }

      await carregar();
      setShowModal(false);
      toast({
        title: "Sucesso",
        description: "Registro salvo com sucesso!",
      });
    } catch (err) {
      console.error('Erro ao salvar processo do advogado', err);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const atualizarProcessoEmAndamento = (index: number, field: keyof ProcessoEmAndamento, value: any) => {
    const clone = [...(selected.processosEmAndamento || [])];
    clone[index] = { ...clone[index], [field]: value };
    setSelected((prev) => ({ ...prev, processosEmAndamento: clone }));
  };

  const adicionarProcesso = () => {
    setSelected((prev) => ({
      ...prev,
      processosEmAndamento: [
        ...(prev.processosEmAndamento || []),
        { numeroProcesso: '', linkProcesso: '', cliente: '', statusProcesso: 'dados_entrada' }
      ]
    }));
  };

  const removerProcesso = (index: number) => {
    const clone = [...(selected.processosEmAndamento || [])];
    clone.splice(index, 1);
    setSelected((prev) => ({ ...prev, processosEmAndamento: clone }));
  };

  const graficoExito = useMemo(() => {
    const { exito, naoExito } = processoAdvogadoService.calcularExito(processos);
    const total = exito + naoExito || 1;
    return {
      data: [
        { name: 'Êxito', value: exito, color: '#22c55e' },
        { name: 'Não êxito', value: naoExito, color: '#6b7280' }
      ],
      resumo: { exito, naoExito, percentualExito: ((exito / total) * 100).toFixed(1) }
    };
  }, [processos]);

  const filteredProcessos = useMemo(() => {
    let result = processos;

    if (filterArea && filterArea !== 'all') {
      result = result.filter(p => p.areaAtuacao === filterArea);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nomeAdvogado.toLowerCase().includes(lower) || 
        p.areaAtuacao.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [processos, searchTerm, filterArea]);

  return {
    processos: filteredProcessos,
    loading,
    saving,
    showModal,
    setShowModal,
    selected,
    setSelected,
    searchTerm,
    setSearchTerm,
    filterArea,
    setFilterArea,
    abrirModalNovo,
    abrirEdicao,
    salvar,
    atualizarProcessoEmAndamento,
    adicionarProcesso,
    removerProcesso,
    graficoExito,
    user,
    isAdmin,
    statusOptions: Object.keys(statusConfig) as StatusProcessoAdvogado[],
    areasAtuacao,
    resultadosAlcancados
  };
};
