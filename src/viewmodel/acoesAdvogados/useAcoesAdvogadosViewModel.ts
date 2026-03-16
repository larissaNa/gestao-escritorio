import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { atendimentoService } from '@/model/services/atendimentoService';
import type { Atendimento } from '@/model/entities';

type StatusOption = {
  value: 'todas' | Atendimento['status'];
  label: string;
};

export function useAcoesAdvogadosViewModel() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filtroAdvogado, setFiltroAdvogado] = useState<string>('todos');
  const [filtroSituacao, setFiltroSituacao] = useState<'todas' | Atendimento['status']>('todas');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const carregarAtendimentosRepassados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const todos = await atendimentoService.getAllAtendimentos();
      const apenasRepassados = todos.filter((a) => Boolean(a.advogadoResponsavel));
      setAtendimentos(apenasRepassados);
    } catch (err) {
      console.error('Erro ao carregar atendimentos repassados:', err);
      setError('Erro ao carregar atendimentos repassados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarAtendimentosRepassados();
  }, [carregarAtendimentosRepassados]);

  const advogados = useMemo(() => {
    return Array.from(
      new Set(
        atendimentos
          .map((a) => a.advogadoResponsavel)
          .filter((nome): nome is string => Boolean(nome)),
      ),
    ).sort();
  }, [atendimentos]);

  const totalRepassados = atendimentos.length;
  const atendimentosEmAndamento = useMemo(() => {
    return atendimentos.filter((a) => a.status === 'em_andamento').length;
  }, [atendimentos]);
  const atendimentosFinalizados = useMemo(() => {
    return atendimentos.filter((a) => a.status === 'finalizado').length;
  }, [atendimentos]);

  const handleFiltroChange = useCallback(
    (opts: { advogado?: string; situacao?: 'todas' | Atendimento['status'] }) => {
      const novoAdvogado = opts.advogado ?? filtroAdvogado;
      const novaSituacao = opts.situacao ?? filtroSituacao;

      setFiltroAdvogado(novoAdvogado);
      setFiltroSituacao(novaSituacao);
    },
    [filtroAdvogado, filtroSituacao],
  );

  const limparFiltros = useCallback(() => {
    setSearchTerm('');
    setFiltroAdvogado('todos');
    setFiltroSituacao('todas');
  }, []);

  const formatarData = useCallback((data: Date) => {
    return data.toLocaleDateString('pt-BR');
  }, []);

  const getStatusLabel = useCallback((status: Atendimento['status']) => {
    if (status === 'em_andamento') return 'Em andamento';
    if (status === 'aguardando_documentacao') return 'Aguardando documentação';
    if (status === 'repassado') return 'Repassado';
    if (status === 'fechado_com_contrato') return 'Fechado com contrato';
    if (status === 'encerrado_sem_contrato') return 'Encerrado sem contrato';
    if (status === 'finalizado') return 'Finalizado';
    return status;
  }, []);

  const getStatusVariant = useCallback((status: Atendimento['status']) => {
    if (status === 'finalizado') return 'default';
    if (status === 'em_andamento') return 'secondary';
    return 'outline';
  }, []);

  const handleChangeStatus = useCallback(
    async (atendimento: Atendimento, novoStatus: Atendimento['status']) => {
      if (atendimento.status === novoStatus) return;

      try {
        setUpdatingId(atendimento.id);
        await atendimentoService.atualizarAtendimento(atendimento.id, {
          status: novoStatus,
        });

        setAtendimentos((prev) =>
          prev.map((item) => (item.id === atendimento.id ? { ...item, status: novoStatus } : item)),
        );

        toast.success('Status do repasse atualizado com sucesso!');
      } catch (err) {
        console.error('Erro ao atualizar status do repasse:', err);
        setError('Erro ao atualizar status do repasse');
        toast.error('Erro ao atualizar status do repasse');
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  const atendimentosFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return atendimentos.filter((atendimento) => {
      const matchesSearch =
        !termo ||
        atendimento.clienteNome.toLowerCase().includes(termo) ||
        atendimento.clienteCpf.includes(searchTerm) ||
        (atendimento.advogadoResponsavel || '').toLowerCase().includes(termo) ||
        (atendimento.tipoProcedimento || '').toLowerCase().includes(termo) ||
        (atendimento.tipoAcao || '').toLowerCase().includes(termo) ||
        (atendimento.cidade || '').toLowerCase().includes(termo);

      const matchesAdvogado = filtroAdvogado === 'todos' || atendimento.advogadoResponsavel === filtroAdvogado;

      const matchesSituacao = filtroSituacao === 'todas' || atendimento.status === filtroSituacao;

      return matchesSearch && matchesAdvogado && matchesSituacao;
    });
  }, [atendimentos, filtroAdvogado, filtroSituacao, searchTerm]);

  const statusOptions: StatusOption[] = useMemo(() => {
    return [
      { value: 'todas', label: 'Todas' },
      { value: 'em_andamento', label: 'Em andamento' },
      { value: 'aguardando_documentacao', label: 'Aguardando documentação' },
      { value: 'repassado', label: 'Repassado' },
      { value: 'fechado_com_contrato', label: 'Fechado com contrato' },
      { value: 'encerrado_sem_contrato', label: 'Encerrado sem contrato' },
      { value: 'finalizado', label: 'Finalizado' },
    ];
  }, []);

  return {
    loading,
    error,
    updatingId,

    searchTerm,
    setSearchTerm,
    filtroAdvogado,
    filtroSituacao,
    handleFiltroChange,
    limparFiltros,

    advogados,
    totalRepassados,
    atendimentosEmAndamento,
    atendimentosFinalizados,
    totalAdvogados: advogados.length,

    atendimentosFiltrados,
    statusOptions,
    formatarData,
    getStatusLabel,
    getStatusVariant,
    handleChangeStatus,
    recarregar: carregarAtendimentosRepassados,
  };
}

