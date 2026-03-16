import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { servicoService } from '@/model/services/servicoService';
import { toast } from 'sonner';
import { useConfigListOptions } from '@/viewmodel/configLists/useConfigListOptions';

export const useNovoServico = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    area: '',
    tipoAcao: '',
    honorarios: '',
    observacoes: '',
    advogadoResponsavel: '',
    linkProcuração: '',
    linkChecklist: '',
    ativo: true
  });

  const { options: areasOptions } = useConfigListOptions('area', { activeOnly: true });
  const areas = areasOptions.map((o) => o.value);

  const advogados = [
    'Dr. Phortus Leonardo',
    'Dr. Thiago Oliveira',
    'Dra. Janaina Oliveira',
    'Dr. Thalisson Reinaldo',
    'Dra. Lara Andrade',
    'Equipe'
  ];

  useEffect(() => {
    const loadServico = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setIsEditing(true);
        const servico = await servicoService.buscarPorId(id);
        
        if (servico) {
          setFormData({
            area: servico.area,
            tipoAcao: servico.tipoAcao,
            honorarios: servico.honorarios,
            observacoes: servico.observacoes,
            advogadoResponsavel: servico.advogadoResponsavel,
            linkProcuração: servico.linkProcuração || '',
            linkChecklist: servico.linkChecklist || '',
            ativo: servico.ativo
          });
        } else {
          toast.error('Serviço não encontrado');
          setError('Serviço não encontrado');
          navigate('/servicos');
        }
      } catch (err) {
        console.error('Erro ao carregar serviço:', err);
        toast.error('Erro ao carregar serviço');
        setError('Erro ao carregar serviço');
      } finally {
        setLoading(false);
      }
    };

    loadServico();
  }, [id, navigate]);

  const handleCancel = () => {
    navigate('/servicos');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.area || !formData.tipoAcao || !formData.honorarios || !formData.advogadoResponsavel) {
      toast.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      
      if (id) {
        await servicoService.atualizarServico(id, formData);
      } else {
        await servicoService.criarServico(formData);
      }

      toast.success('Serviço salvo com sucesso!');
      navigate('/servicos');
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
      toast.error('Erro ao salvar serviço');
      setError('Erro ao salvar serviço');
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
    areas,
    advogados,
    handleSubmit,
    handleCancel
  };
};
