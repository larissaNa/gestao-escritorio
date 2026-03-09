import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { relatorioService } from '@/model/services/relatorioService';
import { RelatorioItem } from '@/model/entities';

export const demandas = [
  { nome: 'Petição inicial', pontos: 5 },
  { nome: 'Recursos', pontos: 5 },
  { nome: 'Petição ADM', pontos: 4 },
  { nome: 'Impugnação, manifestação e réplicas', pontos: 4 },
  { nome: 'Atendimento', pontos: 3 },
  { nome: 'Produção e roteiro', pontos: 3 },
  { nome: 'Diligências', pontos: 2 },
  { nome: 'Exigência, prorrogação, análise de processo', pontos: 2 },
  { nome: 'Gravações de vídeo e edições de vídeo', pontos: 2 },
  { nome: 'Organização de doc, digitalização, balcão, atualização de senha', pontos: 1 },
  { nome: 'Conferença de e-mail e PJE e repasse de demanda', pontos: 2 }
];

export const tiposAcao = [
  'Aposentadoria urbana',
  'Aposentadoria rural',
  'Benefício por incapacidade',
  'Salário maternidade',
  'Pensão por morte',
  'BPC Deficiente',
  'BPC Idoso',
  'Ação civil',
  'Ação trabalhista',
  'Ações gerenciais',
  'Ações administrativas',
  'Outras ações'
];

export const setores = ['ADM', 'Judicial', 'Diligências', 'Atendimentos', 'Marketing', 'Outros'];

export const useNovoRelatorio = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, colaboradorName } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
          setFormData({
            demanda: relatorio.demanda || '',
            protocolo: relatorio.protocolo || '',
            cliente: relatorio.cliente || '',
            tipo_acao: relatorio.tipo_acao || '',
            setor: relatorio.setor || '',
            pontos: relatorio.pontos || 0,
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
  }, [id, navigate]);

  const handleDemandaChange = (value: string) => {
    const selected = demandas.find(d => d.nome === value);
    setFormData(prev => ({
      ...prev,
      demanda: value,
      pontos: selected?.pontos || 0
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
      
      const responsavelNome = colaboradorName || user.displayName ||
        (user.email ? user.email.split('@')[0] : 'Usuário não identificado');

      const relatorioData = {
        ...formData,
        responsavel: user.uid,
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
    demandas,
    tiposAcao,
    setores,
    handleDemandaChange,
    handleSubmit,
    handleCancel
  };
};
