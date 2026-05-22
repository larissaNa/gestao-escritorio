import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { relatorioService } from '@/model/services/relatorioService';
import { RelatorioItem } from '@/model/entities';
import { useConfigListOptions } from '@/viewmodel/configLists/useConfigListOptions';

export const useNovoRelatorio = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, colaboradorName } = useAuth();

  const { options: demandasOptions, demandaPoints } = useConfigListOptions('demanda', { activeOnly: true });
  const { options: tiposAcaoOptions } = useConfigListOptions('tipo_acao', { activeOnly: true });
  const { options: setoresOptions } = useConfigListOptions('setor', { activeOnly: true });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const responsavelNomeAuto = colaboradorName || user?.displayName || user?.email || 'Desconhecido';
  const [responsavelPersistido, setResponsavelPersistido] = useState<{ uid: string; nome: string }>({
    uid: '',
    nome: ''
  });

  const [formData, setFormData] = useState({
    demanda: '',
    protocolo: '',
    cliente: '',
    tipo_acao: '',
    setor: '',
    pontos: 0,
    observacao: ''
  });

  useEffect(() => {
    const loadRelatorio = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setIsEditing(true);
        const relatorio = await relatorioService.getById(id);
        
        if (relatorio) {
          setResponsavelPersistido({
            uid: relatorio.responsavel || '',
            nome: relatorio.responsavelNome || 'Usuário não identificado'
          });

          // Tenta recuperar os pontos se estiverem zerados mas houver uma demanda
          let pontos = relatorio.pontos || 0;
          if (pontos === 0 && relatorio.demanda) {
            pontos = demandaPoints.get(relatorio.demanda) ?? 0;
          }

          setFormData({
            demanda: relatorio.demanda || '',
            protocolo: relatorio.protocolo || '',
            cliente: relatorio.cliente || '',
            tipo_acao: relatorio.tipo_acao || '',
            setor: relatorio.setor || '',
            pontos: pontos,
            observacao: relatorio.observacao || ''
          });
        } else {
          toast.error('Relatório não encontrado');
          setError('Relatório não encontrado');
          navigate('/relatorio');
        }
      } catch (err) {
        console.error('Erro ao carregar relatório:', err);
        toast.error('Erro ao carregar relatório');
        setError('Erro ao carregar relatório');
      } finally {
        setLoading(false);
      }
    };

    loadRelatorio();
  }, [id, navigate, demandaPoints]);

  useEffect(() => {
    if (isEditing && formData.demanda && formData.pontos === 0) {
      const pontosAtualizados = demandaPoints.get(formData.demanda);
      if (pontosAtualizados && pontosAtualizados > 0) {
        setFormData(prev => ({ ...prev, pontos: pontosAtualizados }));
      }
    }
  }, [demandaPoints, isEditing, formData.demanda, formData.pontos]);

  useEffect(() => {
    if (id) return;
    if (!user) return;
    setResponsavelPersistido((prev) => (prev.uid ? prev : { uid: user.uid, nome: responsavelNomeAuto }));
  }, [id, user, responsavelNomeAuto]);

  const handleDemandaChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      demanda: value,
      pontos: demandaPoints.get(value) ?? 0
    }));
  };

  const handleCancel = () => {
    navigate('/relatorio');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const responsavelUid = (isEditing && responsavelPersistido.uid) ? responsavelPersistido.uid : user.uid;
      const responsavelNome = (isEditing && responsavelPersistido.nome) ? responsavelPersistido.nome : responsavelNomeAuto;

      const relatorioData = {
        ...formData,
        responsavel: responsavelUid,
        responsavelNome,
        dataRelatorio: new Date().toISOString().split('T')[0],
        status: 'ativo' as const
      };

      if (id) {
        await relatorioService.atualizarRelatorio(id, relatorioData);
        toast.success('Relatório atualizado com sucesso!');
      } else {
        await relatorioService.criarRelatorio(relatorioData);
        toast.success('Relatório criado com sucesso!');
      }

      navigate('/relatorio');
    } catch (err) {
      console.error('Erro ao salvar relatório:', err);
      toast.error('Erro ao salvar relatório');
      setError('Erro ao salvar relatório');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    isEditing,
    demandas: demandasOptions.map((o) => ({ nome: o.label, pontos: o.pontos ?? 0 })),
    tiposAcao: tiposAcaoOptions.map((o) => o.value),
    setores: setoresOptions.map((o) => o.value),
    responsavelDisplay: responsavelPersistido.nome || responsavelNomeAuto,
    handleDemandaChange,
    handleSubmit,
    handleCancel
  };
};
