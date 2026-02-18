import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
// import { preCadastroService } from '@/model/services/preCadastroService';
import { atendimentoService } from '@/model/services/atendimentoService';
import { beneficioService } from '@/model/services/beneficioService';
import { concessaoService } from '@/model/services/concessaoService';
import { Cliente, Atendimento, PreCadastro } from '@/model/entities';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CHART_COLORS = [
  'hsl(262, 80%, 65%)',
  'hsl(32, 95%, 55%)',
  'hsl(220, 15%, 75%)',
  'hsl(350, 80%, 65%)',
  'hsl(195, 85%, 50%)',
  'hsl(45, 95%, 55%)',
  'hsl(160, 70%, 50%)',
  'hsl(262, 80%, 65%)',
  'hsl(32, 95%, 55%)',
  'hsl(350, 80%, 65%)',
  'hsl(195, 85%, 50%)',
  'hsl(45, 95%, 55%)',
];

export const useDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // const [clientesAguardando, setClientesAguardando] = useState<PreCadastro[]>([]);
  const [atendimentosHoje, setAtendimentosHoje] = useState<Atendimento[]>([]);
  const [totalAtendimentos, setTotalAtendimentos] = useState(0);
  
  // Year selection
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const anosDisponiveis = Array.from({ length: 3 }, (_, index) => currentYear - index);

  // Chart Data
  const [atendimentosPorMes, setAtendimentosPorMes] = useState<{ mes: string; valor: number }[]>([]);
  const [beneficiosPorAno, setBeneficiosPorAno] = useState<{ mes: string; valor: number }[]>([]);
  const [concessoesPorMes, setConcessoesPorMes] = useState<{ mes: string; valor: number }[]>([]);
  const [tiposBeneficio, setTiposBeneficio] = useState<{ name: string; value: number; color: string }[]>([]);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Carregar atendimentos de hoje
      const hoje = new Date();
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
      const atendimentos = await atendimentoService.getAtendimentosByPeriodo(inicioDia, fimDia);
      setAtendimentosHoje(atendimentos);

      // Carregar total de atendimentos
      const totalCount = await atendimentoService.getAtendimentosCount();
      setTotalAtendimentos(totalCount);

      // Função auxiliar para gráficos
      const ano = parseInt(selectedYear);
      
      const gerarGraficoAtendimentosPorMes = async () => {
        const dadosMensais = Array(12).fill(0);
        const atendimentosAno = await atendimentoService.getAtendimentosByYear(ano, 500);

        atendimentosAno.forEach((atendimento: any) => {
          if (atendimento.dataAtendimento) {
            const data = new Date(atendimento.dataAtendimento);
            if (data.getFullYear() === ano) {
              const mes = data.getMonth();
              dadosMensais[mes]++;
            }
          }
        });

        const formattedData = MONTH_LABELS.map((label, index) => ({
          mes: label,
          valor: dadosMensais[index]
        }));
        
        setAtendimentosPorMes(formattedData);
      };

      const gerarGraficoBeneficiosPorAno = async () => {
        const beneficiosAno = await beneficioService.getBeneficiosByYear(ano, 400);
        const meses: { [key: number]: number } = {};

        beneficiosAno.forEach((beneficio: any) => {
          if (beneficio.dataCriacao) {
            const mes = beneficio.dataCriacao.getMonth();
            meses[mes] = (meses[mes] || 0) + 1;
          }
        });

        const formattedData = MONTH_LABELS.map((label, index) => ({
          mes: label,
          valor: meses[index] || 0
        }));

        setBeneficiosPorAno(formattedData);
      };

      const gerarGraficoTiposBeneficio = async () => {
        const todosBeneficios = await beneficioService.getBeneficiosByYear(ano, 400);
        const tipos: { [key: string]: number } = {};

        todosBeneficios.forEach((beneficio: any) => {
          const tipo = beneficio.tipo || "Não informado";
          tipos[tipo] = (tipos[tipo] || 0) + 1;
        });

        const formattedData = Object.entries(tipos).map(([name, value], index) => ({
          name,
          value,
          color: CHART_COLORS[index % CHART_COLORS.length]
        }));

        setTiposBeneficio(formattedData);
      };

      const gerarGraficoConcessoesPorMes = async () => {
        try {
          const concessoesAno = await concessaoService.getConcessoesByYear(ano, 400);
          const dadosMensais = Array(12).fill(0);

          concessoesAno.forEach((concessao: any) => {
            if (concessao.data) {
              const data = concessao.data instanceof Date ? concessao.data : new Date(concessao.data);
              if (data.getFullYear() === ano) {
                const mes = data.getMonth();
                dadosMensais[mes]++;
              }
            }
          });

          const formattedData = MONTH_LABELS.map((label, index) => ({
            mes: label,
            valor: dadosMensais[index]
          }));

          setConcessoesPorMes(formattedData);
        } catch (error) {
          console.error("Erro ao carregar concessões:", error);
        }
      };

      // Carregar dados para gráficos
      await Promise.all([
        gerarGraficoAtendimentosPorMes(),
        gerarGraficoBeneficiosPorAno(),
        gerarGraficoTiposBeneficio(),
        gerarGraficoConcessoesPorMes()
      ]);

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      const msg = 'Erro ao carregar dados do dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);


  return {
    loading,
    error,
    // clientesAguardando,
    atendimentosHoje,
    totalAtendimentos,
    selectedYear,
    setSelectedYear,
    anosDisponiveis,
    atendimentosPorMes,
    beneficiosPorAno,
    concessoesPorMes,
    tiposBeneficio,
    CHART_COLORS
  };
};


