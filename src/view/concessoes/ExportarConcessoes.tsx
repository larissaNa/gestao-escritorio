import React, { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert';
import { Input } from '@/view/components/ui/input';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { concessaoService } from '@/model/services/concessaoService';
import { colaboradorService, ColaboradorData } from '@/model/services/colaboradorService';
import { Concessao } from '@/model/entities';

const PDF_LOGO_PATH = '/images/logo2.png';
const PDF_OFFICE_NAME = 'Escritório Dr. Phortus Leonardo Advogados Associados';

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Falha ao ler imagem'));
    reader.readAsDataURL(blob);
  });

const loadPdfLogoDataUrl = async () => {
  try {
    const res = await fetch(PDF_LOGO_PATH);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
};

const drawPdfHeader = (
  doc: jsPDF,
  input: {
    title: string;
    rightText?: string;
    logoDataUrl: string | null;
  },
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const headerTop = 24;
  const headerHeight = 64;

  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, headerTop, pageWidth - marginX * 2, headerHeight, 'F');

  const logoW = input.logoDataUrl ? 64 : 0;
  const logoH = 38;
  const logoX = marginX + 12;
  const logoY = headerTop + 13;
  if (input.logoDataUrl) {
    doc.addImage(input.logoDataUrl, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
  }

  const textX = input.logoDataUrl ? logoX + logoW + 12 : logoX;
  const rightX = pageWidth - marginX - 12;
  const maxTextWidth = rightX - textX;

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(PDF_OFFICE_NAME, maxTextWidth), textX, headerTop + 22);

  doc.setFontSize(16);
  doc.text(doc.splitTextToSize(input.title, maxTextWidth), textX, headerTop + 46);

  if (input.rightText) {
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(10);
    (doc as any).text(input.rightText, rightX, headerTop + 20, { align: 'right' });
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, headerTop + headerHeight, pageWidth - marginX, headerTop + headerHeight);

  return { marginX, contentStartY: headerTop + headerHeight + 18 };
};

const ExportarConcessoes = () => {
  const [concessoes, setConcessoes] = useState<Concessao[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hoje = new Date();
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('todos');
  const [filtroMes, setFiltroMes] = useState<string>(String(hoje.getMonth() + 1));
  const [filtroAno, setFiltroAno] = useState<string>(String(hoje.getFullYear()));
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        // Carrega um número maior de registros para o relatório
        const [listaConcessoes, listaColaboradores] = await Promise.all([
          concessaoService.getAllConcessoes(1000),
          colaboradorService.getAllColaboradores()
        ]);
        
        setConcessoes(listaConcessoes);
        setColaboradores(listaColaboradores);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados para exportação');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Mapeamento de UID para Departamento/Setor
  const mapaSetores = useMemo(() => {
    const map = new Map<string, string>();
    colaboradores.forEach(c => {
      if (c.uid && c.departamento) {
        map.set(c.uid, c.departamento);
      }
    });
    return map;
  }, [colaboradores]);

  const opcoesFiltros = useMemo(() => {
    const responsaveisMap = new Map<string, string>();
    const mesesSet = new Set<number>();
    const anosSet = new Set<number>();
    const tiposSet = new Set<string>();

    concessoes.forEach(c => {
      if (c.responsavelUID) {
        const nome = c.responsavelNome || 'Desconhecido';
        responsaveisMap.set(c.responsavelUID, nome);
      }
      
      const data = c.data instanceof Date ? c.data : (c.data as any).toDate?.() || new Date(c.data);
      if (data) {
        mesesSet.add(data.getMonth() + 1);
        anosSet.add(data.getFullYear());
      }

      if (c.tipo) {
        tiposSet.add(c.tipo);
      }
    });

    // Adiciona datas atuais se não existirem
    const now = new Date();
    mesesSet.add(now.getMonth() + 1);
    anosSet.add(now.getFullYear());

    return {
      responsaveis: Array.from(responsaveisMap.entries()).map(([uid, nome]) => ({ uid, nome })).sort((a, b) => a.nome.localeCompare(b.nome)),
      meses: Array.from(mesesSet.values()).sort((a, b) => a - b),
      anos: Array.from(anosSet.values()).sort((a, b) => b - a),
      tipos: Array.from(tiposSet.values()).sort()
    };
  }, [concessoes]);

  const getMesNome = (mes: number) => {
    const mesesNomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return mesesNomes[mes - 1] || '';
  };

  const concessoesFiltradas = useMemo(() => {
    return concessoes.filter(c => {
      const data = c.data instanceof Date ? c.data : (c.data as any).toDate?.() || new Date(c.data);
      
      if (filtroResponsavel !== 'todos' && c.responsavelUID !== filtroResponsavel) return false;
      if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
      
      if (filtroMes !== 'todos') {
        if (data.getMonth() + 1 !== Number(filtroMes)) return false;
      }
      
      if (filtroAno !== 'todos') {
        if (data.getFullYear() !== Number(filtroAno)) return false;
      }

      return true;
    });
  }, [concessoes, filtroResponsavel, filtroMes, filtroAno, filtroTipo]);

  const handleExportarPdf = async () => {
    if (!concessoesFiltradas.length) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // Filtros aplicados
    const mesTexto = filtroMes === 'todos' ? 'Todos' : getMesNome(Number(filtroMes));
    const anoTexto = filtroAno === 'todos' ? 'Todos' : filtroAno;
    const tipoTexto = filtroTipo === 'todos' ? 'Todos' : filtroTipo;
    
    let respNome = 'Todos';
    if (filtroResponsavel !== 'todos') {
      const resp = opcoesFiltros.responsaveis.find(r => r.uid === filtroResponsavel);
      if (resp) respNome = resp.nome;
    }

    const nowLabel = new Date().toLocaleString('pt-BR');
    const logoDataUrl = await loadPdfLogoDataUrl();
    const headerInput = {
      title: 'Relatório de Concessões',
      rightText: `Gerado em: ${nowLabel}`,
      logoDataUrl,
    };

    const { marginX, contentStartY } = drawPdfHeader(doc, headerInput);
    const didDrawPage = () => {
      drawPdfHeader(doc, headerInput);
    };

    const pageHeight = doc.internal.pageSize.getHeight();
    let y = contentStartY;

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Período: ${mesTexto}/${anoTexto}`, 40, y);
    y += 14;
    doc.text(`Tipo: ${tipoTexto}`, 40, y);
    y += 14;
    doc.text(`Responsável: ${respNome}`, 40, y);
    y += 22;

    // Agrupamento por Responsável
    const dadosAgrupados = new Map<string, Concessao[]>();
    concessoesFiltradas.forEach(c => {
      const uid = c.responsavelUID || 'sem-resp';
      if (!dadosAgrupados.has(uid)) {
        dadosAgrupados.set(uid, []);
      }
      dadosAgrupados.get(uid)?.push(c);
    });

    // Ordenar responsáveis por quantidade (decrescente)
    const gruposOrdenados = Array.from(dadosAgrupados.entries())
      .sort((a, b) => b[1].length - a[1].length);

    gruposOrdenados.forEach(([uid, lista]) => {
      const nomeResponsavel = lista[0]?.responsavelNome || 'Responsável não definido';
      const setor = mapaSetores.get(uid) || 'Setor não informado';
      const qtd = lista.length;

      // Verifica se precisa de nova página
      if (y > pageHeight - 120) {
        doc.addPage();
        drawPdfHeader(doc, headerInput);
        y = contentStartY;
      }

      // Cabeçalho do Grupo
      doc.setFillColor(240, 240, 240);
      doc.rect(40, y - 10, 515, 25, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`${nomeResponsavel} (${setor}) - ${qtd} concessões`, 50, y + 7);
      y += 25;

      // Tabela de Itens
      autoTable(doc, {
        startY: y,
        head: [['Data', 'Cliente', 'Tipo', 'Nome']],
        body: lista.map(item => {
          const data = item.data instanceof Date ? item.data : (item.data as any).toDate?.() || new Date(item.data);
          return [
            data.toLocaleDateString('pt-BR'),
            item.cliente || '-',
            item.tipo || '-',
            item.nome || '-'
          ];
        }),
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [100, 100, 100], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 150 },
          2: { cellWidth: 100 },
          3: { cellWidth: 185 }
        },
        theme: 'grid',
        margin: { top: contentStartY, left: marginX, right: marginX, bottom: 40 },
        didDrawPage
      });

      // Atualiza Y para o próximo grupo
      const lastY = (doc as any).lastAutoTable?.finalY || y;
      y = lastY + 30;
    });

    doc.save(`Relatorio_Concessoes_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Exportar Concessões" 
        description="Gere relatórios PDF das concessões filtradas por período e responsável."
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={filtroMes} onValueChange={setFiltroMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {opcoesFiltros.meses.map(m => (
                    <SelectItem key={m} value={String(m)}>{getMesNome(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={filtroAno} onValueChange={setFiltroAno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {opcoesFiltros.anos.map(a => (
                    <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {opcoesFiltros.tipos.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {opcoesFiltros.responsaveis.map(r => (
                    <SelectItem key={r.uid} value={r.uid}>{r.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleExportarPdf} 
              disabled={loading || concessoesFiltradas.length === 0}
              className="w-full md:w-auto gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Setor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Carregando dados...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : concessoesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                concessoesFiltradas.map((item, index) => {
                  const data = item.data instanceof Date ? item.data : (item.data as any).toDate?.() || new Date(item.data);
                  const setor = mapaSetores.get(item.responsavelUID) || '-';
                  return (
                    <TableRow key={item.id || index}>
                      <TableCell>{data.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{item.cliente}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.nome || '-'}</TableCell>
                      <TableCell>{item.responsavelNome}</TableCell>
                      <TableCell>{setor}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportarConcessoes;
