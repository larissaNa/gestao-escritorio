import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { idasBancoService } from '@/model/services/idasBancoService';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export function useNovaIdaViewModel() {
  const { user, colaboradorName } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [clienteNome, setClienteNome] = useState('');
  const [banco, setBanco] = useState('');
  const [dataIda, setDataIda] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [numeroIda, setNumeroIda] = useState(1);

  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      loadIda(id);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) return;

    const checkIdasCount = async () => {
      if (clienteNome.length > 2) {
        try {
          const count = await idasBancoService.countIdasCliente(clienteNome);
          setNumeroIda(count + 1);
        } catch (error) {
          console.error("Erro ao contar idas", error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      checkIdasCount();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [clienteNome, isEditing]);

  const loadIda = async (idaId: string) => {
    try {
      setLoading(true);
      const ida = await idasBancoService.getIdaById(idaId);
      if (ida) {
        setClienteNome(ida.clienteNome);
        setBanco(ida.banco);
        setDataIda(format(ida.dataIda, 'yyyy-MM-dd'));
        setNumeroIda(ida.numeroIda);
      } else {
        toast.error('Ida não encontrada.');
        navigate('/idas-banco');
      }
    } catch (error) {
      console.error('Erro ao carregar ida:', error);
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!clienteNome || !banco || !dataIda) {
      toast.warning('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing && id) {
        await idasBancoService.updateIda(id, {
          clienteNome,
          dataIda: new Date(dataIda + 'T12:00:00'),
          banco,
          numeroIda
        });
        toast.success('Registro atualizado com sucesso!');
      } else {
        await idasBancoService.addIda({
          clienteNome,
          responsavelId: user?.uid || '',
          responsavelNome: colaboradorName || user?.displayName || user?.email || 'Desconhecido',
          dataIda: new Date(dataIda + 'T12:00:00'),
          banco,
          numeroIda,
          observacoes: ''
        });
        toast.success('Ida agendada/registrada com sucesso!');
      }
      
      navigate('/idas-banco');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar ida ao banco.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/idas-banco');
  };

  return {
    loading,
    saving,
    clienteNome,
    setClienteNome,
    banco,
    setBanco,
    dataIda,
    setDataIda,
    numeroIda,
    setNumeroIda,
    colaboradorName,
    user,
    handleSave,
    handleCancel,
    isEditing
  };
}
