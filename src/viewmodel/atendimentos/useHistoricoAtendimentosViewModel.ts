import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { atendimentoService } from '@/model/services/atendimentoService';
import { clienteService } from '@/model/services/clienteService';
import type { Atendimento, Cliente, AtendimentoStatus } from '@/model/entities';
import { toast } from 'sonner';

const normalizeCpf = (cpf: string) => cpf.replace(/\D/g, '');

const isValidDate = (d: Date) => Number.isFinite(d.getTime()) && d.getTime() > 0;

const statusLabel = (status: AtendimentoStatus) => {
  switch (status) {
    case 'em_andamento':
      return 'Em andamento';
    case 'aguardando_documentacao':
      return 'Aguardando documentação';
    case 'repassado':
      return 'Repassado';
    case 'fechado_com_contrato':
      return 'Fechado com contrato';
    case 'encerrado_sem_contrato':
      return 'Encerrado sem contrato';
    case 'finalizado':
      return 'Finalizado';
    default:
      return status;
  }
};

const statusBadgeClass = (status: AtendimentoStatus) => {
  switch (status) {
    case 'fechado_com_contrato':
      return 'bg-success/10 text-success border-success/20';
    case 'encerrado_sem_contrato':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'aguardando_documentacao':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'repassado':
      return 'bg-info/10 text-info border-info/20';
    case 'finalizado':
      return 'bg-success/10 text-success border-success/20';
    default:
      return 'bg-accent/10 text-accent border-accent/20';
  }
};

export const useHistoricoAtendimentos = () => {
  const navigate = useNavigate();
  const { cpf: cpfParam } = useParams();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [historico, setHistorico] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cpfRaw = useMemo(() => decodeURIComponent(cpfParam || ''), [cpfParam]);
  const cpfDigits = useMemo(() => normalizeCpf(cpfRaw), [cpfRaw]);

  useEffect(() => {
    const carregar = async () => {
      if (!cpfRaw) {
        setError('CPF não informado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [histDirect, clienteDirect] = await Promise.all([
          atendimentoService.getAtendimentosByCpf(cpfRaw),
          clienteService.getClienteByCpf(cpfRaw),
        ]);

        const histFallback =
          histDirect.length === 0 && cpfDigits && cpfDigits !== cpfRaw
            ? await atendimentoService.getAtendimentosByCpf(cpfDigits)
            : [];

        const clienteFallback =
          !clienteDirect && cpfDigits && cpfDigits !== cpfRaw ? await clienteService.getClienteByCpf(cpfDigits) : null;

        const byId = new Map<string, Atendimento>();
        for (const it of [...histDirect, ...histFallback]) {
          byId.set(it.id, it);
        }

        const mergedHistorico = Array.from(byId.values()).sort(
          (a, b) => b.dataAtendimento.getTime() - a.dataAtendimento.getTime(),
        );

        setHistorico(mergedHistorico);
        setCliente(clienteDirect || clienteFallback || null);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
        setError('Erro ao carregar histórico');
        toast.error('Erro ao carregar histórico');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [cpfRaw, cpfDigits]);

  const historicoAsc = useMemo(
    () => [...historico].sort((a, b) => a.dataAtendimento.getTime() - b.dataAtendimento.getTime()),
    [historico],
  );

  const totalAtendimentos = historico.length;
  const primeiroAtendimento = historicoAsc.find((h) => isValidDate(h.dataAtendimento))?.dataAtendimento || null;
  const ultimoAtendimento = historico.find((h) => isValidDate(h.dataAtendimento))?.dataAtendimento || null;

  const clienteNome = cliente?.nome || historico[0]?.clienteNome || '';
  const clienteCpf = cliente?.cpf || historico[0]?.clienteCpf || cpfRaw;
  const clienteTelefone = cliente?.telefone || historico[0]?.clienteTelefone || '';
  const clienteCidade = cliente?.cidade || historico[0]?.cidade || '';

  const ultimoRegistro = historico[0] || null;
  const ultimaSituacao =
    totalAtendimentos > 1 && primeiroAtendimento && ultimoAtendimento && ultimoAtendimento.getTime() !== primeiroAtendimento.getTime()
      ? 'Retorno'
      : totalAtendimentos > 0
        ? 'Primeiro atendimento'
        : '-';

  const handleBack = () => navigate(-1);

  return {
    loading,
    error,
    cpfRaw,
    cpfDigits,
    historico,
    totalAtendimentos,
    primeiroAtendimento,
    ultimoAtendimento,
    ultimaSituacao,
    ultimoRegistro,
    clienteNome,
    clienteCpf,
    clienteTelefone,
    clienteCidade,
    statusLabel,
    statusBadgeClass,
    handleBack,
  };
};

