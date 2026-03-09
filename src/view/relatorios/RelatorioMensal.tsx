import React, { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { Badge } from '@/view/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { relatorioService } from '@/model/services/relatorioService';
import { RelatorioItem } from '@/model/entities';
import { AlertCircle, Filter, Loader2, Trophy, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type ResumoColaborador = {
  uid: string;
  nome: string;
  pontos: number;
};

const RelatorioMensal = () => {
  const { isAdmin } = useAuth();

  const [relatorios, setRelatorios] = useState<RelatorioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hoje = new Date();
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('ALL');
  const [filtroMes, setFiltroMes] = useState<string>(String(hoje.getMonth() + 1));
  const [filtroAno, setFiltroAno] = useState<string>(String(hoje.getFullYear()));

  useEffect(() => {
    const carregarRelatorios = async () => {
      try {
        setLoading(true);
        const dados = await relatorioService.buscarTodos();
        setRelatorios(dados);
      } catch (err) {
        console.error('Erro ao carregar relatórios:', err);
        setError('Erro ao carregar relatórios');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      carregarRelatorios();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const { responsaveis, meses, anos } = useMemo(() => {
    const responsaveisMap = new Map<string, string>();
    const mesesSet = new Set<number>();
    const anosSet = new Set<number>();

    relatorios.forEach(relatorio => {
      if (relatorio.responsavel) {
        const nome = relatorio.responsavelNome || relatorio.responsavel;
        if (!responsaveisMap.has(relatorio.responsavel)) {
          responsaveisMap.set(relatorio.responsavel, nome);
        }
      }

      if (relatorio.mes) {
        mesesSet.add(relatorio.mes);
      }

      if (relatorio.data instanceof Date) {
        anosSet.add(relatorio.data.getFullYear());
      }
    });

    const now = new Date();
    mesesSet.add(now.getMonth() + 1);
    anosSet.add(now.getFullYear());

    return {
      responsaveis: Array.from(responsaveisMap.entries()).map(([uid, nome]) => ({
        uid,
        nome,
      })),
      meses: Array.from(mesesSet.values()).sort((a, b) => a - b),
      anos: Array.from(anosSet.values()).sort((a, b) => a - b),
    };
  }, [relatorios]);

  const getMesNome = (mes: number) => {
    const mesesNomes = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return mesesNomes[mes - 1] || '';
  };

  const relatoriosFiltrados = useMemo(() => {
    return relatorios.filter(relatorio => {
      if (filtroResponsavel !== 'ALL' && relatorio.responsavel !== filtroResponsavel) {
        return false;
      }

      if (filtroMes !== 'ALL' && relatorio.mes !== Number(filtroMes)) {
        return false;
      }

      if (
        filtroAno !== 'ALL' &&
        relatorio.data instanceof Date &&
        relatorio.data.getFullYear() !== Number(filtroAno)
      ) {
        return false;
      }

      return true;
    });
  }, [relatorios, filtroResponsavel, filtroMes, filtroAno]);

  const resumoColaboradores = useMemo<ResumoColaborador[]>(() => {
    const mapa = new Map<string, ResumoColaborador>();

    relatoriosFiltrados.forEach(relatorio => {
      const uid = relatorio.responsavel;
      const nome = relatorio.responsavelNome || uid;
      const pontos = relatorio.pontos || 0;

      if (!uid) {
        return;
      }

      if (!mapa.has(uid)) {
        mapa.set(uid, { uid, nome, pontos });
      } else {
        const atual = mapa.get(uid);
        if (atual) {
          atual.pontos += pontos;
          mapa.set(uid, atual);
        }
      }
    });

    return Array.from(mapa.values()).sort((a, b) => b.pontos - a.pontos);
  }, [relatoriosFiltrados]);

  const tarefasPorResponsavel = useMemo(() => {
    const mapa = new Map<string, RelatorioItem[]>();

    relatoriosFiltrados.forEach(relatorio => {
      const uid = relatorio.responsavel;
      if (!uid) {
        return;
      }

      const existentes = mapa.get(uid) || [];
      existentes.push(relatorio);
      mapa.set(uid, existentes);
    });

    return mapa;
  }, [relatoriosFiltrados]);

  const topColaborador = resumoColaboradores[0] || null;

  const handleExportarPdf = () => {
    if (!relatoriosFiltrados.length) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 60;
    const mesNome = filtroMes === 'ALL' ? 'Todos' : getMesNome(Number(filtroMes));
    const anoLabel = filtroAno === 'ALL' ? 'Todos' : filtroAno;
    const responsavelLabel =
      filtroResponsavel === 'ALL'
        ? 'Todos'
        : (responsaveis.find(r => r.uid === filtroResponsavel)?.nome || filtroResponsavel);

    doc.setFontSize(18);
    doc.text('Relatório Mensal', 40, y);
    y += 26;

    doc.setFontSize(12);
    doc.text(`Responsável: ${responsavelLabel}`, 40, y);
    y += 18;
    doc.text(`Período: ${mesNome} ${anoLabel !== 'Todos' ? anoLabel : ''}`.trim(), 40, y);
    y += 18;
    if (topColaborador) {
      doc.text(`Destaque: ${topColaborador.nome} (${topColaborador.pontos} pontos)`, 40, y);
      y += 22;
    }

    autoTable(doc, {
      startY: y,
      head: [['Colaborador', 'Pontos', 'Atividades']],
      body: resumoColaboradores.map(item => {
        const tarefas = tarefasPorResponsavel.get(item.uid) || [];
        return [String(item.nome), String(item.pontos), String(tarefas.length)];
      }),
      styles: { fontSize: 11, cellPadding: 6 },
      headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 280 },
        1: { cellWidth: 100, halign: 'right' },
        2: { cellWidth: 120, halign: 'right' }
      },
      theme: 'grid'
    });
    {
      const lastY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
      y = lastY + 24;
    }

    doc.setFontSize(14);
    doc.text('Detalhamento de atividades', 40, y);
    y += 12;

    resumoColaboradores.forEach(colab => {
      const tarefas = tarefasPorResponsavel.get(colab.uid) || [];
      if (!tarefas.length) return;
      doc.setFontSize(12);
      doc.text(`${colab.nome} - ${colab.pontos} pontos - ${tarefas.length} atividades`, 40, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Data', 'Cliente', 'Demanda', 'Setor', 'Pontos', 'Obs']],
        body: tarefas.map(t => [
          t.data instanceof Date ? t.data.toLocaleDateString('pt-BR') : '',
          String(t.cliente || ''),
          String(t.demanda || ''),
          String(t.setor || ''),
          String(t.pontos || 0),
          String(t.observacao || ''),
        ]),
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 100 },
          2: { cellWidth: 150 },
          3: { cellWidth: 60 },
          4: { cellWidth: 50, halign: 'right' },
          5: { cellWidth: 100 },
        },
        theme: 'grid'
      });
      {
        const lastY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
        y = lastY + 16;
      }
    });

    const fileNameParts = [
      'Relatorio_Mensal',
      filtroMes === 'ALL' ? 'todos-meses' : String(filtroMes),
      filtroAno === 'ALL' ? 'todos-anos' : String(filtroAno),
    ];
    const fileName = `${fileNameParts.join('_')}.pdf`;
    doc.save(fileName);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Relatório Mensal"
          description="Apenas administradores podem acessar esta página."
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso negado</AlertTitle>
          <AlertDescription>
            Você não possui permissão para visualizar o relatório mensal.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatório Mensal em PDF"
        description="Visualize e exporte um relatório mensal com a produtividade da equipe."
      >
        <Button
          onClick={handleExportarPdf}
          disabled={loading || !relatoriosFiltrados.length}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Exportar PDF
        </Button>
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros do Relatório
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select
                value={filtroResponsavel}
                onValueChange={value => setFiltroResponsavel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {responsaveis.map(resp => (
                    <SelectItem key={resp.uid} value={resp.uid}>
                      {resp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={filtroMes} onValueChange={value => setFiltroMes(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {meses.map(mes => (
                    <SelectItem key={mes} value={String(mes)}>
                      {getMesNome(mes)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={filtroAno} onValueChange={value => setFiltroAno(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {anos.map(ano => (
                    <SelectItem key={ano} value={String(ano)}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Prévia do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando dados do relatório...
            </div>
          ) : !relatoriosFiltrados.length ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhum relatório encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Responsável</span>
                  <p className="text-sm font-medium">
                    {filtroResponsavel === 'ALL'
                      ? 'Todos'
                      : responsaveis.find(r => r.uid === filtroResponsavel)?.nome ||
                        'Responsável não encontrado'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Período</span>
                  <p className="text-sm font-medium">
                    {filtroMes === 'ALL' ? 'Todos os meses' : getMesNome(Number(filtroMes))}{' '}
                    {filtroAno === 'ALL' ? '' : filtroAno}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Colaborador em destaque</span>
                  {topColaborador ? (
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Badge variant="secondary" className="px-2 py-0.5">{topColaborador.nome}</Badge>
                      <span className="text-xs text-muted-foreground">{topColaborador.pontos} pontos</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum colaborador encontrado para o período.
                    </p>
                  )}
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead className="text-right">Pontos no período</TableHead>
                      <TableHead className="text-right">Qtd. atividades</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumoColaboradores.map(colaborador => {
                      const tarefas = tarefasPorResponsavel.get(colaborador.uid) || [];
                      return (
                        <TableRow key={colaborador.uid}>
                          <TableCell>{colaborador.nome}</TableCell>
                          <TableCell className="text-right font-medium">
                            {colaborador.pontos}
                          </TableCell>
                          <TableCell className="text-right">{tarefas.length}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">
                  Detalhamento de atividades por colaborador
                </h3>
                {resumoColaboradores.map(colaborador => {
                  const tarefas = tarefasPorResponsavel.get(colaborador.uid) || [];
                  return (
                    <div
                      key={colaborador.uid}
                      className="border rounded-md p-4 space-y-2 bg-muted/40"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{colaborador.nome}</span>
                          <Badge variant="outline">{colaborador.pontos} pontos</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {tarefas.length} atividades
                        </span>
                      </div>
                      <div className="border rounded-md bg-background overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Demanda</TableHead>
                              <TableHead>Setor</TableHead>
                              <TableHead>Obs</TableHead>
                              <TableHead className="text-right">Pontos</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tarefas.map(tarefa => (
                              <TableRow key={tarefa.id}>
                                <TableCell>
                                  {tarefa.data instanceof Date
                                    ? tarefa.data.toLocaleDateString('pt-BR')
                                    : ''}
                                </TableCell>
                                <TableCell className="font-medium">{tarefa.cliente}</TableCell>
                                <TableCell>{tarefa.demanda}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{tarefa.setor}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]" title={tarefa.observacao}>
                                  {tarefa.observacao}
                                </TableCell>
                                <TableCell className="text-right">
                                  {tarefa.pontos || 0}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioMensal;
