import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { processoAdvogadoService } from '@/model/services/processoAdvogadoService';
import { 
  ProcessoAdvogado, 
  ProcessoEmAndamento
} from '@/model/entities';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

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

export function useNovoProcessoViewModel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processo, setProcesso] = useState<ProcessoAdvogado>(emptyProcesso);
  
  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      loadProcesso(id);
    } else {
      // Initialize new
      setProcesso({
        ...emptyProcesso,
        uidAdvogado: user?.uid || '',
        nomeAdvogado: user?.displayName || '',
        dataUltimaAtualizacao: new Date()
      });
    }
  }, [id, user]);

  const loadProcesso = async (procId: string) => {
    try {
      setLoading(true);
      const data = await processoAdvogadoService.getById(procId);
      if (data) {
        setProcesso({ ...data, processosEmAndamento: data.processosEmAndamento || [] });
      } else {
        toast.error("Registro não encontrado");
        navigate('/processos-advogados');
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha ao carregar registro");
    } finally {
      setLoading(false);
    }
  };

  const salvar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      if (isEditing && id) {
        await processoAdvogadoService.update(id, processo);
        toast.success("Registro atualizado com sucesso!");
      } else {
        await processoAdvogadoService.create(processo);
        toast.success("Registro criado com sucesso!");
      }
      navigate('/processos-advogados');
    } catch (err) {
      console.error(err);
      toast.error("Falha ao salvar registro");
    } finally {
      setSaving(false);
    }
  };

  const atualizarProcessoEmAndamento = (index: number, field: keyof ProcessoEmAndamento, value: any) => {
    const clone = [...(processo.processosEmAndamento || [])];
    clone[index] = { ...clone[index], [field]: value };
    setProcesso((prev) => ({ ...prev, processosEmAndamento: clone }));
  };

  const adicionarProcesso = () => {
    setProcesso((prev) => ({
      ...prev,
      processosEmAndamento: [
        ...(prev.processosEmAndamento || []),
        { numeroProcesso: '', linkProcesso: '', cliente: '', statusProcesso: 'dados_entrada' }
      ]
    }));
  };

  const removerProcesso = (index: number) => {
    const clone = [...(processo.processosEmAndamento || [])];
    clone.splice(index, 1);
    setProcesso((prev) => ({ ...prev, processosEmAndamento: clone }));
  };
  
  const handleCancel = () => {
      navigate('/processos-advogados');
  };

  return {
    processo,
    setProcesso,
    loading,
    saving,
    salvar,
    atualizarProcessoEmAndamento,
    adicionarProcesso,
    removerProcesso,
    isEditing,
    handleCancel
  };
}
