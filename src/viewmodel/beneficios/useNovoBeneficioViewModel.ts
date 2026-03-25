import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { beneficioService } from '@/model/services/beneficioService';
import { colaboradorService } from '@/model/services/colaboradorService';
import { BeneficioItem } from '@/model/entities';
import { toast } from 'sonner';

type TrafegoFormValue = '' | 'sim' | 'nao';

export const useNovoBeneficio = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [responsaveis, setResponsaveis] = useState<Array<{ id: string; nome: string }>>([]);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '' as BeneficioItem['tipo'],
    subtipo: '',
    trafego: '' as TrafegoFormValue,
    responsavelUID: '',
    responsavelNome: '',
    cliente: '',
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const carregarResponsaveis = async () => {
      try {
        const colaboradores = await colaboradorService.getAllColaboradores();
        const responsaveisData = colaboradores.map(colaborador => ({
          id: colaborador.id || '',
          nome: colaborador.primeiroNome || 'Desconhecido'
        }));
        setResponsaveis(responsaveisData);
      } catch (err) {
        console.error('Erro ao carregar responsáveis:', err);
        toast.error('Erro ao carregar responsáveis');
      }
    };

    carregarResponsaveis();
  }, []);

  useEffect(() => {
    const loadBeneficio = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setIsEditing(true);
        const beneficio = await beneficioService.getById(id);
        
        if (beneficio) {
          setFormData({
            nome: beneficio.nome,
            tipo: beneficio.tipo,
            subtipo: beneficio.subtipo || '',
            trafego: beneficio.trafego === true ? 'sim' : beneficio.trafego === false ? 'nao' : '',
            responsavelUID: beneficio.responsavelUID,
            responsavelNome: beneficio.responsavelNome,
            cliente: beneficio.cliente,
            data: beneficio.data instanceof Date ? beneficio.data.toISOString().split('T')[0] : new Date(beneficio.data).toISOString().split('T')[0]
          });
        } else {
          toast.error('Benefício não encontrado');
          setError('Benefício não encontrado');
          navigate('/beneficios');
        }
      } catch (err) {
        console.error('Erro ao carregar benefício:', err);
        toast.error('Erro ao carregar benefício');
        setError('Erro ao carregar benefício');
      } finally {
        setLoading(false);
      }
    };

    loadBeneficio();
  }, [id, navigate]);

  const handleCancel = () => {
    navigate('/beneficios');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.tipo || !formData.responsavelUID || !formData.cliente || !formData.data) {
      toast.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!id && formData.trafego === '') {
      toast.warning('Por favor, informe se é tráfego (Sim/Não).');
      return;
    }

    try {
      setLoading(true);
      
      const responsavelSelecionado = responsaveis.find(r => r.id === formData.responsavelUID);
      const trafego =
        formData.trafego === 'sim' ? true : formData.trafego === 'nao' ? false : null;
      const dados = {
        nome: formData.nome,
        tipo: formData.tipo,
        subtipo: formData.subtipo,
        trafego,
        responsavelUID: formData.responsavelUID,
        responsavelNome: formData.responsavelNome || responsavelSelecionado?.nome || 'Desconhecido',
        cliente: formData.cliente,
        data: new Date(formData.data + 'T12:00:00')
      };

      if (id) {
        await beneficioService.atualizarBeneficio(id, dados);
      } else {
        await beneficioService.criarBeneficio(dados);
      }

      toast.success('Benefício salvo com sucesso!');
      navigate('/beneficios');
    } catch (err) {
      console.error('Erro ao salvar benefício:', err);
      toast.error('Erro ao salvar benefício');
      setError('Erro ao salvar benefício');
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
    responsaveis,
    handleSubmit,
    handleCancel
  };
};
