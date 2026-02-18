import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { concessaoService } from '@/model/services/concessaoService';
import { colaboradorService } from '@/model/services/colaboradorService';
import { Concessao, AreaAtuacao } from '@/model/entities';
import { toast } from 'sonner';

export const useNovaConcessao = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [responsaveis, setResponsaveis] = useState<Array<{ id: string; nome: string }>>([]);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '' as AreaAtuacao,
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
    const loadConcessao = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setIsEditing(true);
        const concessao = await concessaoService.getById(id);
        
        if (concessao) {
          setFormData({
            nome: concessao.nome,
            tipo: concessao.tipo,
            responsavelUID: concessao.responsavelUID,
            responsavelNome: concessao.responsavelNome,
            cliente: concessao.cliente,
            data: concessao.data instanceof Date ? concessao.data.toISOString().split('T')[0] : new Date(concessao.data).toISOString().split('T')[0]
          });
        } else {
          toast.error('Concessão não encontrada');
          setError('Concessão não encontrada');
          navigate('/concessoes');
        }
      } catch (err) {
        console.error('Erro ao carregar concessão:', err);
        toast.error('Erro ao carregar concessão');
        setError('Erro ao carregar concessão');
      } finally {
        setLoading(false);
      }
    };

    loadConcessao();
  }, [id, navigate]);

  const handleCancel = () => {
    navigate('/concessoes');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.tipo || !formData.responsavelUID || !formData.cliente || !formData.data) {
      toast.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      
      const responsavelSelecionado = responsaveis.find(r => r.id === formData.responsavelUID);
      const dados = {
        ...formData,
        responsavelNome: formData.responsavelNome || responsavelSelecionado?.nome || 'Desconhecido',
        data: new Date(formData.data + 'T12:00:00')
      };

      if (id) {
        await concessaoService.atualizarConcessao(id, dados);
      } else {
        await concessaoService.criarConcessao(dados);
      }

      toast.success('Concessão salva com sucesso!');
      navigate('/concessoes');
    } catch (err) {
      console.error('Erro ao salvar concessão:', err);
      toast.error('Erro ao salvar concessão');
      setError('Erro ao salvar concessão');
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
