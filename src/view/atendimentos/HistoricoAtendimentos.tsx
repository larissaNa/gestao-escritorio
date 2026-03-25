import { useCallback } from 'react';
import { ArrowLeft, Calendar, FileDown, Loader2, Printer, User } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Badge } from '@/view/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { cn } from '@/lib/utils';
import { useHistoricoAtendimentos } from '@/viewmodel/atendimentos/useHistoricoAtendimentosViewModel';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (d: Date | null) =>
  d && Number.isFinite(d.getTime()) && d.getTime() > 0 ? d.toLocaleDateString('pt-BR') : '-';

const HistoricoAtendimentos = () => {
  const {
    loading,
    error,
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
  } = useHistoricoAtendimentos();

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportPdf = useCallback(() => {
    if (!historico.length) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const title = 'Histórico do Cliente';

    doc.setTextColor(17, 24, 39);
    doc.setFontSize(18);
    doc.text(title, 40, 48);

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.text(`Cliente: ${clienteNome || '-'}`, 40, 72);
    doc.text(`CPF: ${clienteCpf || '-'}`, 40, 90);
    doc.text(`Telefone: ${clienteTelefone || '-'}`, 40, 108);
    doc.text(`Cidade: ${clienteCidade || '-'}`, 40, 126);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 40, 144);

    autoTable(doc, {
      startY: 170,
      head: [['Data', 'Procedimento', 'Ação', 'Modalidade', 'Responsável', 'Cidade', 'Status', 'Observações']],
      body: historico.map((h) => [
        formatDate(h.dataAtendimento),
        h.tipoProcedimento || '-',
        h.tipoAcao || '-',
        h.modalidade || '-',
        h.responsavel || '-',
        h.cidade || '-',
        statusLabel(h.status),
        h.observacoes || '-',
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [100, 100, 100], textColor: 255, fontStyle: 'bold' },
      theme: 'grid',
      margin: { left: 40, right: 40, bottom: 40 },
    });

    doc.save(`Historico_Cliente_${new Date().toISOString().split('T')[0]}.pdf`);
  }, [historico, clienteNome, clienteCpf, clienteTelefone, clienteCidade, statusLabel]);

  return (
    <div className="space-y-6">
      <PageHeader title="Histórico do Cliente" description={clienteNome || 'Atendimentos do cliente em ordem cronológica'}>
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
        <Button onClick={handleExportPdf} className="gap-2" disabled={!historico.length}>
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </Button>
      </PageHeader>

      {loading ? (
        <Card>
          <CardContent className="py-12 flex justify-center items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Carregando histórico...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-destructive">{error}</CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Resumo do Cliente
              </CardTitle>
              <CardDescription>Visão geral do cliente e dos atendimentos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border bg-muted/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total de Atendimentos</p>
                        <p className="text-2xl font-semibold">{totalAtendimentos}</p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border bg-muted/20">
                  <CardContent className="pt-6">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Primeiro Atendimento</p>
                      <p className="text-lg font-semibold">{formatDate(primeiroAtendimento)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border bg-muted/20">
                  <CardContent className="pt-6">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Último Atendimento</p>
                      <p className="text-lg font-semibold">{formatDate(ultimoAtendimento)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border bg-muted/20">
                  <CardContent className="pt-6">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Última Situação</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium">
                          {ultimaSituacao}
                        </Badge>
                        {ultimoRegistro && (
                          <Badge
                            variant="outline"
                            className={cn('font-medium', statusBadgeClass(ultimoRegistro.status))}
                          >
                            {statusLabel(ultimoRegistro.status)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-medium">{clienteNome || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">CPF</p>
                  <p className="font-medium">{clienteCpf || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-medium">{clienteTelefone || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cidade</p>
                  <p className="font-medium">{clienteCidade || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Histórico de Atendimentos
              </CardTitle>
              <CardDescription>Todos os atendimentos em ordem cronológica (mais recente primeiro)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold w-40">Data</TableHead>
                      <TableHead className="font-semibold min-w-56">Procedimento</TableHead>
                      <TableHead className="font-semibold min-w-56">Ação</TableHead>
                      <TableHead className="font-semibold w-32">Modalidade</TableHead>
                      <TableHead className="font-semibold min-w-52">Responsável</TableHead>
                      <TableHead className="font-semibold w-40">Cidade</TableHead>
                      <TableHead className="font-semibold w-44">Status</TableHead>
                      <TableHead className="font-semibold min-w-72">Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historico.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          Nenhum atendimento encontrado para este CPF.
                        </TableCell>
                      </TableRow>
                    ) : (
                      historico.map((h, idx) => (
                        <TableRow key={h.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span>{formatDate(h.dataAtendimento)}</span>
                              {idx === 0 && (
                                <span className="text-xs text-muted-foreground">(mais recente)</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{h.tipoProcedimento || '-'}</TableCell>
                          <TableCell>{h.tipoAcao || '-'}</TableCell>
                          <TableCell>{h.modalidade || '-'}</TableCell>
                          <TableCell className="truncate">{h.responsavel || '-'}</TableCell>
                          <TableCell>{h.cidade || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('font-medium', statusBadgeClass(h.status))}>
                              {statusLabel(h.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[22rem] truncate" title={h.observacoes || ''}>
                            {h.observacoes || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default HistoricoAtendimentos;

