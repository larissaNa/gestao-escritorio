import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { idasBancoService } from '@/services/idasBancoService';
import { IdaBanco } from '@/types';
import { format } from 'date-fns';

export function useIdasBanco() {
  const { user, colaboradorName } = useAuth();
  const [idas, setIdas] = useState<IdaBanco[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [clienteNome, setClienteNome] = useState('');
  const [banco, setBanco] = useState('');
  const [dataIda, setDataIda] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [numeroIda, setNumeroIda] = useState(1);

  useEffect(() => {
    loadIdas();
  }, []);

  // Ao alterar o nome do cliente, tenta calcular o número da ida
  useEffect(() => {
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
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [clienteNome]);

  const loadIdas = async () => {
    try {
      setLoading(true);
      const data = await idasBancoService.getIdas();
      setIdas(data);
    } catch (error) {
      console.error('Erro ao carregar idas:', error);
      alert('Erro ao carregar idas ao banco.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!clienteNome || !banco || !dataIda) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      
      if (editingId) {
        await idasBancoService.updateIda(editingId, {
          clienteNome,
          dataIda: new Date(dataIda + 'T12:00:00'),
          banco,
          numeroIda
        });
        alert('Registro atualizado com sucesso!');
      } else {
        await idasBancoService.addIda({
          clienteNome,
          responsavelId: user?.uid || '',
          responsavelNome: colaboradorName || user?.displayName || user?.email || 'Desconhecido',
          dataIda: new Date(dataIda + 'T12:00:00'), // Fixando hora para evitar problemas de timezone
          banco,
          numeroIda,
          observacoes: ''
        });
        alert('Ida agendada/registrada com sucesso!');
      }
      
      setShowModal(false);
      resetForm();
      loadIdas();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar ida ao banco.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ida: IdaBanco) => {
    setEditingId(ida.id);
    setClienteNome(ida.clienteNome);
    setBanco(ida.banco);
    setDataIda(format(ida.dataIda, 'yyyy-MM-dd'));
    setNumeroIda(ida.numeroIda);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await idasBancoService.deleteIda(id);
        loadIdas();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir registro.');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setClienteNome('');
    setBanco('');
    setDataIda(format(new Date(), 'yyyy-MM-dd'));
    setNumeroIda(1);
  };

  const filteredIdas = idas.filter(ida => 
    ida.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ida.responsavelNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ida.banco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    idas,
    loading,
    showModal,
    setShowModal,
    saving,
    searchTerm,
    setSearchTerm,
    editingId,
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
    handleEdit,
    handleDelete,
    resetForm,
    filteredIdas
  };
}
