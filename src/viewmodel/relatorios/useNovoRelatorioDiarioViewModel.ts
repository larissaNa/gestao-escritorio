import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { relatorioDiarioService } from '@/model/services/relatorioDiarioService';

export const useNovoRelatorioDiario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, colaboradorName } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const responsavelNomeAuto = colaboradorName || user?.displayName || user?.email || 'Estagiário';
  const [responsavelPersistido, setResponsavelPersistido] = useState<{ uid: string; nome: string }>({
    uid: user?.uid || '',
    nome: responsavelNomeAuto,
  });

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
  });

  useEffect(() => {
    if (!id && user) {
      setResponsavelPersistido({
        uid: user.uid,
        nome: responsavelNomeAuto,
      });
    }
  }, [id, user, responsavelNomeAuto]);

  useEffect(() => {
    const carregarRelatorio = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setIsEditing(true);
        const item = await relatorioDiarioService.getById(id);

        if (item) {
          setResponsavelPersistido({
            uid: item.responsavelId || '',
            nome: item.responsavelNome || 'Estagiário',
          });

          const dataStr = item.data instanceof Date
            ? item.data.toISOString().split('T')[0]
            : String(item.data).split('T')[0];

          setFormData({
            data: dataStr,
            descricao: item.descricao || '',
          });
        } else {
          toast.error('Relatório diário não encontrado');
          setError('Relatório diário não encontrado');
          navigate('/relatorio/diario');
        }
      } catch (err) {
        console.error('Erro ao carregar relatório diário:', err);
        toast.error('Erro ao carregar relatório diário');
        setError('Erro ao carregar relatório diário');
      } finally {
        setLoading(false);
      }
    };

    carregarRelatorio();
  }, [id, navigate]);

  const handleCancel = () => {
    navigate('/relatorio/diario');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Usuário não autenticado.');
      return;
    }

    if (!formData.descricao.trim()) {
      toast.error('Por favor, informe a descrição das atividades.');
      return;
    }

    try {
      setLoading(true);
      const responsavelId = isEditing && responsavelPersistido.uid ? responsavelPersistido.uid : user.uid;
      const responsavelNome = isEditing && responsavelPersistido.nome ? responsavelPersistido.nome : responsavelNomeAuto;

      // Converter data string YYYY-MM-DD para Date local
      const [ano, mes, dia] = formData.data.split('-').map(Number);
      const dataDate = new Date(ano, mes - 1, dia, 12, 0, 0);

      const dadosParaSalvar = {
        responsavelId,
        responsavelNome,
        data: dataDate,
        descricao: formData.descricao.trim(),
      };

      if (id) {
        await relatorioDiarioService.atualizar(id, dadosParaSalvar);
        toast.success('Relatório diário atualizado com sucesso!');
      } else {
        await relatorioDiarioService.criar(dadosParaSalvar);
        toast.success('Relatório diário registrado com sucesso!');
      }

      navigate('/relatorio/diario');
    } catch (err) {
      console.error('Erro ao salvar relatório diário:', err);
      toast.error('Erro ao salvar relatório diário');
      setError('Erro ao salvar relatório diário');
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
    responsavelDisplay: responsavelPersistido.nome || responsavelNomeAuto,
    handleSubmit,
    handleCancel,
  };
};
