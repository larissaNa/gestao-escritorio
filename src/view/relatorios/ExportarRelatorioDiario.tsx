import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { Badge } from '@/view/components/ui/badge';
import { Input } from '@/view/components/ui/input';
import { AlertCircle, Filter, Loader2, FileDown, ArrowLeft, BookOpen, Calendar, X } from 'lucide-react';
import { relatorioDiarioService } from '@/model/services/relatorioDiarioService';
import { RelatorioDiarioItem } from '@/model/entities';
import { gerarPdfRelatorioDiario } from '@/utils/pdfRelatorioDiario';
import { toast } from 'sonner';

const ExportarRelatorioDiario: React.FC = () => {
  const [relatorios, setRelatorios] = useState<RelatorioDiarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  const hoje = new Date();
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('ALL');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');
  const [filtroMes, setFiltroMes] = useState<string>('ALL');
  const [filtroAno, setFiltroAno] = useState<string>(String(hoje.getFullYear()));

  const limparFiltros = () => {
    setFiltroResponsavel('ALL');
    setFiltroMes('ALL');
    setFiltroAno(String(hoje.getFullYear()));
    setFiltroDataInicio('');
    setFiltroDataFim('');
  };

  useEffect(() => {
    const carregarRelatorios = async () => {
      try {
        setLoading(true);
        const dados = await relatorioDiarioService.buscarTodos();
        setRelatorios(dados);
      } catch (err) {
        console.error('Erro ao carregar relatórios diários:', err);
        setError('Erro ao carregar relatórios para exportação');
      } finally {
        setLoading(false);
      }
    };

    carregarRelatorios();
  }, []);

  const getMesNome = (mes: number) => {
    const mesesNomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return mesesNomes[mes - 1] || '';
  };

  const { responsaveis, anos } = useMemo(() => {
    const responsaveisMap = new Map<string, string>();
    const anosSet = new Set<number>();

    relatorios.forEach((item) => {
      if (item.responsavelId) {
        responsaveisMap.set(item.responsavelId, item.responsavelNome || 'Estagiário');
      }
      if (item.data instanceof Date) {
        anosSet.add(item.data.getFullYear());
      }
    });

    anosSet.add(new Date().getFullYear());

    return {
      responsaveis: Array.from(responsaveisMap.entries()).map(([uid, nome]) => ({
        uid,
        nome,
      })).sort((a, b) => a.nome.localeCompare(b.nome)),
      anos: Array.from(anosSet.values()).sort((a, b) => b - a),
    };
  }, [relatorios]);

  const relatoriosFiltrados = useMemo(() => {
    return relatorios.filter((item) => {
      if (filtroResponsavel !== 'ALL' && item.responsavelId !== filtroResponsavel && item.responsavelNome !== filtroResponsavel) {
        return false;
      }

      const itemDate = item.data instanceof Date ? item.data : new Date(item.data);
      const itemDataStr = itemDate.toISOString().split('T')[0];

      if (filtroDataInicio && itemDataStr < filtroDataInicio) {
        return false;
      }

      if (filtroDataFim && itemDataStr > filtroDataFim) {
        return false;
      }

      if (filtroMes !== 'ALL' && itemDate.getMonth() + 1 !== Number(filtroMes)) {
        return false;
      }

      if (filtroAno !== 'ALL' && itemDate.getFullYear() !== Number(filtroAno)) {
        return false;
      }

      return true;
    });
  }, [relatorios, filtroResponsavel, filtroDataInicio, filtroDataFim, filtroMes, filtroAno]);

  const handleExportarPdf = async () => {
    if (!relatoriosFiltrados.length) return;

    try {
      setExportando(true);
      const respNome = filtroResponsavel === 'ALL'
        ? 'Todos'
        : (responsaveis.find((r) => r.uid === filtroResponsavel)?.nome || filtroResponsavel);

      let periodoLabel = '';
      if (filtroDataInicio || filtroDataFim) {
        const d1 = filtroDataInicio ? filtroDataInicio.split('-').reverse().join('/') : 'Início';
        const d2 = filtroDataFim ? filtroDataFim.split('-').reverse().join('/') : 'Fim';
        periodoLabel = `De ${d1} até ${d2}`;
      } else {
        const mesLabel = filtroMes === 'ALL' ? 'Todos os meses' : getMesNome(Number(filtroMes));
        const anoLabel = filtroAno === 'ALL' ? '' : filtroAno;
        periodoLabel = `${mesLabel} ${anoLabel}`.trim();
      }

      await gerarPdfRelatorioDiario({
        items: relatoriosFiltrados,
        filtroResponsavelNome: respNome,
        periodoLabel,
        fileName: `Relatorio_Diario_Estagiarios_${new Date().toISOString().split('T')[0]}.pdf`,
      });
      toast.success('PDF do Diário de Bordo exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      toast.error('Erro ao exportar PDF');
    } finally {
      setExportando(false);
    }
  };

  const formatarData = (data: Date | unknown) => {
    if (data instanceof Date) {
      return data.toLocaleDateString('pt-BR');
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exportar Relatório Diário em PDF"
        description="Filtre e exporte o diário de bordo com as atividades registradas pelos estagiários."
      >
        <div className="flex gap-2">
          <Link to="/relatorio/diario">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Diário
            </Button>
          </Link>
          <Button
            onClick={handleExportarPdf}
            disabled={loading || exportando || !relatoriosFiltrados.length}
            className="gap-2"
          >
            {exportando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Card de Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros para Exportação
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={limparFiltros}>
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Responsáveis</SelectItem>
                  {responsaveis.map((resp) => (
                    <SelectItem key={resp.uid} value={resp.uid}>
                      {resp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={filtroMes} onValueChange={setFiltroMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Meses</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {getMesNome(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={filtroAno} onValueChange={setFiltroAno}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Anos</SelectItem>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={String(ano)}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Data Inicial (De)
              </Label>
              <Input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Data Final (Até)
              </Label>
              <Input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prévia do Relatório */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Prévia dos Registros ({relatoriosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando dados para prévia...
            </div>
          ) : !relatoriosFiltrados.length ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhum registro encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 bg-muted/30 p-4 rounded-md">
                <div>
                  <span className="text-xs text-muted-foreground">Responsável</span>
                  <p className="text-sm font-medium">
                    {filtroResponsavel === 'ALL'
                      ? 'Todos'
                      : responsaveis.find((r) => r.uid === filtroResponsavel)?.nome || filtroResponsavel}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Período</span>
                  <p className="text-sm font-medium">
                    {filtroDataInicio || filtroDataFim
                      ? `${filtroDataInicio ? filtroDataInicio.split('-').reverse().join('/') : 'Início'} até ${filtroDataFim ? filtroDataFim.split('-').reverse().join('/') : 'Fim'}`
                      : `${filtroMes === 'ALL' ? 'Todos os meses' : getMesNome(Number(filtroMes))} ${filtroAno === 'ALL' ? '' : filtroAno}`}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Total de Registros</span>
                  <p className="text-sm font-medium">{relatoriosFiltrados.length} registros diários</p>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Data</TableHead>
                      <TableHead className="w-[200px]">Responsável</TableHead>
                      <TableHead>Descrição das Atividades</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatoriosFiltrados.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium align-top whitespace-nowrap">
                          {formatarData(item.data)}
                        </TableCell>
                        <TableCell className="align-top">
                          <span className="font-semibold text-sm">{item.responsavelNome}</span>
                        </TableCell>
                        <TableCell className="align-top">
                          <p className="text-sm whitespace-pre-wrap">{item.descricao}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportarRelatorioDiario;
