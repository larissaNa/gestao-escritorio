import { useEffect, useMemo, useState } from 'react';
import { atendimentoService } from '@/model/services/atendimentoService';
import type { Atendimento } from '@/model/entities';
import { toast } from 'sonner';

type ClienteFechado = {
  clienteNome: string;
  clienteCpf: string;
  clienteTelefone: string;
  cidade: string;
  responsavel: string;
  totalFechamentos: number;
  ultimoFechamento: Date;
};

const normalizeCpf = (cpf: string) => cpf.replace(/\D/g, '');

const isValidDate = (d: Date) => Number.isFinite(d.getTime()) && d.getTime() > 0;

export const useFechamentosAtendimentos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fechados, setFechados] = useState<Atendimento[]>([]);
  const [totalAtendimentos, setTotalAtendimentos] = useState(0);
  const [totalFechados, setTotalFechados] = useState(0);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        setError(null);

        const [listaFechados, countTotal, countFechados] = await Promise.all([
          atendimentoService.getAtendimentosByStatus('fechado_com_contrato', 500),
          atendimentoService.getAtendimentosCount(),
          atendimentoService.getAtendimentosCountByStatus('fechado_com_contrato'),
        ]);

        setFechados(listaFechados);
        setTotalAtendimentos(countTotal);
        setTotalFechados(countFechados);
      } catch (err) {
        console.error('Erro ao carregar fechamentos:', err);
        setError('Erro ao carregar fechamentos');
        toast.error('Erro ao carregar fechamentos');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const taxaConversao = useMemo(() => {
    if (!totalAtendimentos) return 0;
    return (totalFechados / totalAtendimentos) * 100;
  }, [totalAtendimentos, totalFechados]);

  const clientesFechados = useMemo<ClienteFechado[]>(() => {
    const byCpf = new Map<string, ClienteFechado>();

    const fechadosOrdenados = [...fechados].sort((a, b) => b.dataAtendimento.getTime() - a.dataAtendimento.getTime());

    for (const at of fechadosOrdenados) {
      const cpfKey = normalizeCpf(at.clienteCpf) || at.clienteCpf;
      const existing = byCpf.get(cpfKey);

      const data = isValidDate(at.dataAtendimento) ? at.dataAtendimento : new Date(0);

      if (!existing) {
        byCpf.set(cpfKey, {
          clienteNome: at.clienteNome || '-',
          clienteCpf: at.clienteCpf || '-',
          clienteTelefone: at.clienteTelefone || '-',
          cidade: at.cidade || '-',
          responsavel: at.responsavel || '-',
          totalFechamentos: 1,
          ultimoFechamento: data,
        });
        continue;
      }

      byCpf.set(cpfKey, {
        ...existing,
        totalFechamentos: existing.totalFechamentos + 1,
        ultimoFechamento: data.getTime() > existing.ultimoFechamento.getTime() ? data : existing.ultimoFechamento,
      });
    }

    return Array.from(byCpf.values()).sort((a, b) => b.ultimoFechamento.getTime() - a.ultimoFechamento.getTime());
  }, [fechados]);

  return {
    loading,
    error,
    fechados,
    totalAtendimentos,
    totalFechados,
    taxaConversao,
    clientesFechados,
  };
};

