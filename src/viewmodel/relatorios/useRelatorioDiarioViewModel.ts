import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { relatorioDiarioService } from '@/model/services/relatorioDiarioService';
import { RelatorioDiarioItem } from '@/model/entities';
import { gerarPdfRelatorioDiario } from '@/utils/pdfRelatorioDiario';

export interface FiltrosRelatorioDiario {
  responsavel: string;
  dataInicio: string;
  dataFim: string;
  termo: string;
}

export const useRelatorioDiario = () => {
  const navigate = useNavigate();
  const { user, isAdmin, colaboradorName } = useAuth();

  const [relatorios, setRelatorios] = useState<RelatorioDiarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [exportandoPdf, setExportandoPdf] = useState(false);

  const [filtros, setFiltros] = useState<FiltrosRelatorioDiario>({
    responsavel: 'ALL',
    dataInicio: '',
    dataFim: '',
    termo: '',
  });

  const carregarRelatorios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await relatorioDiarioService.buscarTodos();
      setRelatorios(dados);
    } catch (err) {
      console.error('Erro ao carregar relatórios diários:', err);
      setError('Erro ao carregar relatórios diários');
      toast.error('Erro ao carregar relatórios diários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      carregarRelatorios();
    }
  }, [user, carregarRelatorios]);

  const handleNew = () => {
    navigate('/relatorio/diario/novo');
  };

  const handleEdit = (relatorio: RelatorioDiarioItem) => {
    if (relatorio.id) {
      navigate(`/relatorio/diario/editar/${relatorio.id}`);
    }
  };

  const handleExportPage = () => {
    navigate('/relatorio/diario/exportar');
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await relatorioDiarioService.excluir(deleteId);
      await carregarRelatorios();
      toast.success('Registro diário excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir relatório diário:', err);
      toast.error('Erro ao excluir relatório diário');
    } finally {
      setDeleteId(null);
    }
  };

  const aplicarFiltros = (novosFiltros: Partial<FiltrosRelatorioDiario>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
  };

  const limparFiltros = () => {
    setFiltros({
      responsavel: 'ALL',
      dataInicio: '',
      dataFim: '',
      termo: '',
    });
  };

  const relatoriosFiltrados = useMemo(() => {
    return relatorios.filter((item) => {
      // Filtro por responsável
      if (filtros.responsavel && filtros.responsavel !== 'ALL') {
        if (item.responsavelId !== filtros.responsavel && item.responsavelNome !== filtros.responsavel) {
          return false;
        }
      }

      // Filtro por data
      const itemDataStr = item.data instanceof Date
        ? item.data.toISOString().split('T')[0]
        : String(item.data).split('T')[0];

      if (filtros.dataInicio && itemDataStr < filtros.dataInicio) {
        return false;
      }

      if (filtros.dataFim && itemDataStr > filtros.dataFim) {
        return false;
      }

      // Filtro por termo (busca na descrição ou nome)
      if (filtros.termo && filtros.termo.trim() !== '') {
        const termoLower = filtros.termo.toLowerCase().trim();
        const descricaoMatch = item.descricao?.toLowerCase().includes(termoLower);
        const responsavelMatch = item.responsavelNome?.toLowerCase().includes(termoLower);
        if (!descricaoMatch && !responsavelMatch) {
          return false;
        }
      }

      return true;
    });
  }, [relatorios, filtros]);

  const obterOpcoesFiltros = useMemo(() => {
    const responsaveisMap = new Map<string, string>();
    relatorios.forEach((r) => {
      if (r.responsavelId) {
        responsaveisMap.set(r.responsavelId, r.responsavelNome || 'Estagiário');
      } else if (r.responsavelNome) {
        responsaveisMap.set(r.responsavelNome, r.responsavelNome);
      }
    });

    const responsaveis = Array.from(responsaveisMap.entries()).map(([uid, nome]) => ({
      uid,
      nome,
    })).sort((a, b) => a.nome.localeCompare(b.nome));

    return { responsaveis };
  }, [relatorios]);

  const exportarPdfDireto = async () => {
    try {
      setExportandoPdf(true);
      const respNome = filtros.responsavel === 'ALL'
        ? 'Todos'
        : (obterOpcoesFiltros.responsaveis.find((r) => r.uid === filtros.responsavel)?.nome || filtros.responsavel);

      let periodoLabel = 'Todos';
      if (filtros.dataInicio && filtros.dataFim) {
        const d1 = filtros.dataInicio.split('-').reverse().join('/');
        const d2 = filtros.dataFim.split('-').reverse().join('/');
        periodoLabel = `De ${d1} até ${d2}`;
      } else if (filtros.dataInicio) {
        const d1 = filtros.dataInicio.split('-').reverse().join('/');
        periodoLabel = `A partir de ${d1}`;
      } else if (filtros.dataFim) {
        const d2 = filtros.dataFim.split('-').reverse().join('/');
        periodoLabel = `Até ${d2}`;
      }

      await gerarPdfRelatorioDiario({
        items: relatoriosFiltrados,
        filtroResponsavelNome: respNome,
        periodoLabel,
      });
      toast.success('PDF do relatório diário exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      toast.error('Erro ao gerar arquivo PDF');
    } finally {
      setExportandoPdf(false);
    }
  };

  return {
    relatorios: relatoriosFiltrados,
    totalRelatorios: relatorios.length,
    loading,
    error,
    filtros,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    handleNew,
    handleEdit,
    handleExportPage,
    confirmDelete,
    cancelDelete,
    executeDelete,
    deleteId,
    exportarPdfDireto,
    exportandoPdf,
    user,
    isAdmin,
    colaboradorName,
  };
};
