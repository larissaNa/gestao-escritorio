import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { caminhoClienteService } from '@/model/services/caminhoClienteService';
import {
  CaminhoCliente,
  EtapaCaminho,
  SituacaoCaminho,
  ETAPAS_CAMINHO,
} from '@/model/entities';

export function useCaminhoClienteTimelineViewModel() {
  const { user, colaboradorName } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [caminho, setCaminho] = useState<CaminhoCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [avancando, setAvancando] = useState(false);

  // form "avançar etapa"
  const [novaEtapa, setNovaEtapa] = useState<EtapaCaminho | ''>('');
  const [novaSituacao, setNovaSituacao] = useState<SituacaoCaminho | ''>('');
  const [observacao, setObservacao] = useState('');
  const [proximaAcao, setProximaAcao] = useState('');
  const [prazo, setPrazo] = useState<string>(''); // yyyy-mm-dd

  useEffect(() => {
    if (id) carregar(id);
  }, [id]);

  const carregar = async (registroId: string) => {
    try {
      setLoading(true);
      const data = await caminhoClienteService.getById(registroId);
      if (!data) {
        toast.error('Registro não encontrado');
        navigate('/caminho-cliente');
        return;
      }
      setCaminho(data);
      const sugestaoAtual = ETAPAS_CAMINHO.find((e) => e.key === data.etapaAtual);
      const proximaOrdem = (sugestaoAtual?.ordem ?? 0) + 1;
      const proxima = ETAPAS_CAMINHO.find((e) => e.ordem === proximaOrdem);
      setNovaEtapa(proxima?.key ?? '');
      setProximaAcao(proxima?.proximaAcaoSugerida ?? '');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar registro');
    } finally {
      setLoading(false);
    }
  };

  const avancar = async () => {
    if (!caminho?.id || !novaEtapa) {
      toast.error('Selecione a próxima etapa');
      return;
    }
    try {
      setAvancando(true);
      await caminhoClienteService.avancarEtapa(caminho.id, {
        novaEtapa: novaEtapa as EtapaCaminho,
        situacao: novaSituacao ? (novaSituacao as SituacaoCaminho) : undefined,
        responsavel: colaboradorName || user?.displayName || 'Sistema',
        responsavelUid: user?.uid,
        observacao: observacao || undefined,
        proximaAcao: proximaAcao || undefined,
        prazoProximaAcao: prazo ? new Date(prazo) : null,
      });
      toast.success('Etapa avançada com sucesso');
      setObservacao('');
      setNovaSituacao('');
      setPrazo('');
      await carregar(caminho.id);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao avançar etapa');
    } finally {
      setAvancando(false);
    }
  };

  const progresso = caminho ? caminhoClienteService.progresso(caminho) : 0;
  const diasParado = caminho ? caminhoClienteService.diasParado(caminho) : 0;

  return {
    caminho,
    loading,
    avancando,
    novaEtapa,
    setNovaEtapa,
    novaSituacao,
    setNovaSituacao,
    observacao,
    setObservacao,
    proximaAcao,
    setProximaAcao,
    prazo,
    setPrazo,
    avancar,
    progresso,
    diasParado,
    voltar: () => navigate('/caminho-cliente'),
    editar: () => caminho?.id && navigate(`/caminho-cliente/editar/${caminho.id}`),
  };
}
