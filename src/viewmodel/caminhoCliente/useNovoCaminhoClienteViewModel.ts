import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { caminhoClienteService } from '@/model/services/caminhoClienteService';
import { CaminhoCliente, ETAPAS_CAMINHO } from '@/model/entities';

const etapaInicial = ETAPAS_CAMINHO[0];

const emptyCaminho: CaminhoCliente = {
  clienteNome: '',
  clienteCpf: '',
  tipoBeneficio: '',
  numeroProcessoAdm: '',
  numeroProcessoJud: '',
  etapaAtual: etapaInicial.key,
  situacao: 'em_andamento',
  setorResponsavel: etapaInicial.setorSugerido,
  responsavelAtual: '',
  proximaAcao: etapaInicial.proximaAcaoSugerida,
  prazoProximaAcao: null,
  observacoes: '',
  historico: [],
  dataUltimaMovimentacao: new Date(),
  dataCadastro: new Date(),
  ativo: true,
};

export function useNovoCaminhoClienteViewModel() {
  const { user, colaboradorName } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [caminho, setCaminho] = useState<CaminhoCliente>(emptyCaminho);
  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      loadCaminho(id);
    } else {
      setCaminho({
        ...emptyCaminho,
        responsavelAtual: colaboradorName || user?.displayName || '',
        dataCadastro: new Date(),
        dataUltimaMovimentacao: new Date(),
      });
    }
  }, [id, user, colaboradorName]);

  const loadCaminho = async (registroId: string) => {
    try {
      setLoading(true);
      const data = await caminhoClienteService.getById(registroId);
      if (data) {
        setCaminho({ ...emptyCaminho, ...data });
      } else {
        toast.error('Registro não encontrado');
        navigate('/caminho-cliente');
      }
    } catch (err) {
      console.error(err);
      toast.error('Falha ao carregar registro');
    } finally {
      setLoading(false);
    }
  };

  const salvar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!caminho.clienteNome?.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }

    try {
      setSaving(true);
      const responsavel = caminho.responsavelAtual || colaboradorName || user?.displayName || 'Sistema';

      if (isEditing && id) {
        await caminhoClienteService.update(id, {
          ...caminho,
          dataUltimaMovimentacao: new Date(),
        });
        toast.success('Registro atualizado');
      } else {
        const historicoInicial = [
          {
            etapa: caminho.etapaAtual,
            data: new Date(),
            responsavel,
            responsavelUid: user?.uid,
            observacao: 'Registro criado',
          },
        ];
        await caminhoClienteService.create({
          ...caminho,
          responsavelAtual: responsavel,
          historico: historicoInicial,
          dataCadastro: new Date(),
          dataUltimaMovimentacao: new Date(),
        });
        toast.success('Registro criado');
      }
      navigate('/caminho-cliente');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao salvar registro');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/caminho-cliente');

  return {
    caminho,
    setCaminho,
    loading,
    saving,
    salvar,
    isEditing,
    handleCancel,
  };
}
