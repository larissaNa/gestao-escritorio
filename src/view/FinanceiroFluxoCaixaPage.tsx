import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText } from "lucide-react";
import { useFinanceiro } from "@/viewmodel/useFinanceiroViewModel";
import { Button } from "@/view/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/view/components/ui/card";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/view/components/ui/table";

type PeriodoTipo = "mensal" | "intervalo" | "trimestral" | "semestral" | "anual";

type PeriodoConfig =
  | { tipo: "mensal"; ano: number; mes: number }
  | { tipo: "intervalo"; ano: number; mesInicio: number; mesFim: number }
  | { tipo: "trimestral"; ano: number; trimestre: 1 | 2 | 3 | 4 }
  | { tipo: "semestral"; ano: number; semestre: 1 | 2 }
  | { tipo: "anual"; ano: number };

type LinhaFluxoCaixa = {
  mesLabel: string;
  receitasPrevistas: number;
  receitasRecebidas: number;
  custosPrevistos: number;
  custosPagos: number;
  saldoPrevisto: number;
  saldoRealizado: number;
};

type TimestampLike = { toDate: () => Date };

type PdfDoc = jsPDF & {
  lastAutoTable?: { finalY?: number };
};

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const saldoClassName = (value: number) => (value < 0 ? "text-red-600" : "text-blue-600");

const PDF_COLOR_RECEITAS: [number, number, number] = [16, 185, 129];
const PDF_COLOR_CUSTOS: [number, number, number] = [239, 68, 68];
const PDF_COLOR_SALDO: [number, number, number] = [59, 130, 246];

const PDF_LOGO_PATH = "/images/logo2.png";
const PDF_OFFICE_NAME = "Escritório Dr. Phortus Leonardo Advogados Associados";

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
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
    subtitle?: string;
    rightText?: string;
    logoDataUrl: string | null;
  },
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const headerTop = 24;
  const headerHeight = 64;

  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, headerTop, pageWidth - marginX * 2, headerHeight, "F");

  const logoW = input.logoDataUrl ? 64 : 0;
  const logoH = 38;
  const logoX = marginX + 12;
  const logoY = headerTop + 13;
  if (input.logoDataUrl) {
    doc.addImage(input.logoDataUrl, "PNG", logoX, logoY, logoW, logoH, undefined, "FAST");
  }

  const textX = input.logoDataUrl ? logoX + logoW + 12 : logoX;
  const rightX = pageWidth - marginX - 12;
  const maxTextWidth = rightX - textX;

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(PDF_OFFICE_NAME, maxTextWidth), textX, headerTop + 22);

  doc.setFontSize(16);
  doc.text(doc.splitTextToSize(input.title, maxTextWidth), textX, headerTop + 46);

  if (input.subtitle) {
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(input.subtitle, maxTextWidth), textX, headerTop + 60);
  }

  if (input.rightText) {
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(10);
    doc.text(input.rightText, rightX, headerTop + 20, { align: "right" });
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, headerTop + headerHeight, pageWidth - marginX, headerTop + headerHeight);

  return { marginX, contentStartY: headerTop + headerHeight + 18 };
};

const isTimestampLike = (value: unknown): value is TimestampLike => {
  if (!value || typeof value !== "object") return false;
  if (!("toDate" in value)) return false;
  return typeof (value as { toDate?: unknown }).toDate === "function";
};

const normalizeDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (isTimestampLike(value)) return value.toDate();
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date(NaN);
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const getPeriodoLabel = (periodo: PeriodoConfig) => {
  if (periodo.tipo === "mensal") return `${MESES[periodo.mes - 1]}/${periodo.ano}`;
  if (periodo.tipo === "intervalo")
    return `${MESES[periodo.mesInicio - 1]} - ${MESES[periodo.mesFim - 1]}/${periodo.ano}`;
  if (periodo.tipo === "trimestral") return `${periodo.trimestre}º Trimestre/${periodo.ano}`;
  if (periodo.tipo === "semestral") return `${periodo.semestre}º Semestre/${periodo.ano}`;
  return `Ano ${periodo.ano}`;
};

const getRange = (periodo: PeriodoConfig) => {
  const startOfMonth = (ano: number, mes1a12: number) => new Date(ano, mes1a12 - 1, 1, 0, 0, 0, 0);
  const endOfMonth = (ano: number, mes1a12: number) => new Date(ano, mes1a12, 0, 23, 59, 59, 999);

  if (periodo.tipo === "mensal") {
    return { start: startOfMonth(periodo.ano, periodo.mes), end: endOfMonth(periodo.ano, periodo.mes) };
  }

  if (periodo.tipo === "intervalo") {
    const mi = Math.min(periodo.mesInicio, periodo.mesFim);
    const mf = Math.max(periodo.mesInicio, periodo.mesFim);
    return { start: startOfMonth(periodo.ano, mi), end: endOfMonth(periodo.ano, mf) };
  }

  if (periodo.tipo === "trimestral") {
    const mesInicio = (periodo.trimestre - 1) * 3 + 1;
    const mesFim = mesInicio + 2;
    return { start: startOfMonth(periodo.ano, mesInicio), end: endOfMonth(periodo.ano, mesFim) };
  }

  if (periodo.tipo === "semestral") {
    const mesInicio = (periodo.semestre - 1) * 6 + 1;
    const mesFim = mesInicio + 5;
    return { start: startOfMonth(periodo.ano, mesInicio), end: endOfMonth(periodo.ano, mesFim) };
  }

  return { start: startOfMonth(periodo.ano, 1), end: endOfMonth(periodo.ano, 12) };
};

const enumerateMonths = (start: Date, end: Date) => {
  const months: Array<{ ano: number; mes: number; key: string; label: string }> = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endCursor = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= endCursor) {
    const ano = cursor.getFullYear();
    const mes = cursor.getMonth() + 1;
    const key = `${ano}-${pad2(mes)}`;
    const label = `${MESES[mes - 1]}/${ano}`;
    months.push({ ano, mes, key, label });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

export default function FinanceiroFluxoCaixaPage() {
  const { loading, receitas, custos, escritorio, setEscritorio, escritoriosOptions, loadingEscritorios } = useFinanceiro();

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [tipoPeriodo, setTipoPeriodo] = useState<PeriodoTipo>("mensal");
  const [ano, setAno] = useState<number>(currentYear);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [mesInicio, setMesInicio] = useState<number>(1);
  const [mesFim, setMesFim] = useState<number>(new Date().getMonth() + 1);
  const [trimestre, setTrimestre] = useState<1 | 2 | 3 | 4>(1);
  const [semestre, setSemestre] = useState<1 | 2>(1);

  const anosDisponiveis = useMemo(() => {
    const anosSet = new Set<number>();
    receitas.forEach(r => {
      const d = normalizeDate(r.dataVencimento);
      if (!Number.isNaN(d.getTime())) anosSet.add(d.getFullYear());
    });
    custos.forEach(c => {
      const d = normalizeDate(c.data);
      if (!Number.isNaN(d.getTime())) anosSet.add(d.getFullYear());
    });
    anosSet.add(currentYear);
    return Array.from(anosSet.values()).sort((a, b) => b - a);
  }, [custos, receitas, currentYear]);

  const periodoConfig: PeriodoConfig = useMemo(() => {
    if (tipoPeriodo === "mensal") return { tipo: "mensal", ano, mes };
    if (tipoPeriodo === "intervalo") return { tipo: "intervalo", ano, mesInicio, mesFim };
    if (tipoPeriodo === "trimestral") return { tipo: "trimestral", ano, trimestre };
    if (tipoPeriodo === "semestral") return { tipo: "semestral", ano, semestre };
    return { tipo: "anual", ano };
  }, [ano, mes, mesFim, mesInicio, semestre, tipoPeriodo, trimestre]);

  const { linhas, totais, periodoLabel } = useMemo(() => {
    const { start, end } = getRange(periodoConfig);
    const periodoLabelLocal = getPeriodoLabel(periodoConfig);

    const mesesLista = enumerateMonths(start, end);

    const receitasNoPeriodo = receitas.filter(r => {
      const d = normalizeDate(r.dataVencimento);
      return d >= start && d <= end;
    });

    const custosNoPeriodo = custos.filter(c => {
      const d = normalizeDate(c.data);
      return d >= start && d <= end;
    });

    const mapa = new Map<string, Omit<LinhaFluxoCaixa, "mesLabel">>();
    mesesLista.forEach(m => {
      mapa.set(m.key, {
        receitasPrevistas: 0,
        receitasRecebidas: 0,
        custosPrevistos: 0,
        custosPagos: 0,
        saldoPrevisto: 0,
        saldoRealizado: 0,
      });
    });

    receitasNoPeriodo.forEach(r => {
      const d = normalizeDate(r.dataVencimento);
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      const atual = mapa.get(key);
      if (!atual) return;
      atual.receitasPrevistas += Number(r.valorTotal) || 0;
      atual.receitasRecebidas += Number(r.valorPago) || 0;
      mapa.set(key, atual);
    });

    custosNoPeriodo.forEach(c => {
      const d = normalizeDate(c.data);
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      const atual = mapa.get(key);
      if (!atual) return;
      const valor = Number(c.valor) || 0;
      atual.custosPrevistos += valor;
      atual.custosPagos += c.pago ? valor : 0;
      mapa.set(key, atual);
    });

    const linhasLocal: LinhaFluxoCaixa[] = mesesLista.map(m => {
      const data = mapa.get(m.key) || {
        receitasPrevistas: 0,
        receitasRecebidas: 0,
        custosPrevistos: 0,
        custosPagos: 0,
        saldoPrevisto: 0,
        saldoRealizado: 0,
      };

      const saldoPrevisto = data.receitasPrevistas - data.custosPrevistos;
      const saldoRealizado = data.receitasRecebidas - data.custosPagos;

      return {
        mesLabel: m.label,
        receitasPrevistas: data.receitasPrevistas,
        receitasRecebidas: data.receitasRecebidas,
        custosPrevistos: data.custosPrevistos,
        custosPagos: data.custosPagos,
        saldoPrevisto,
        saldoRealizado,
      };
    });

    const totaisLocal = linhasLocal.reduce(
      (acc, cur) => {
        acc.receitasPrevistas += cur.receitasPrevistas;
        acc.receitasRecebidas += cur.receitasRecebidas;
        acc.custosPrevistos += cur.custosPrevistos;
        acc.custosPagos += cur.custosPagos;
        acc.saldoPrevisto += cur.saldoPrevisto;
        acc.saldoRealizado += cur.saldoRealizado;
        return acc;
      },
      {
        receitasPrevistas: 0,
        receitasRecebidas: 0,
        custosPrevistos: 0,
        custosPagos: 0,
        saldoPrevisto: 0,
        saldoRealizado: 0,
      },
    );

    return { linhas: linhasLocal, totais: totaisLocal, periodoLabel: periodoLabelLocal };
  }, [custos, periodoConfig, receitas]);

  const exportarPdf = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const nowLabel = new Date().toLocaleString("pt-BR");
    const logoDataUrl = await loadPdfLogoDataUrl();
    const headerInput = {
      title: "Fluxo de Caixa",
      subtitle: `Período: ${periodoLabel}`,
      rightText: `Gerado em: ${nowLabel}`,
      logoDataUrl,
    };
    const { marginX, contentStartY } = drawPdfHeader(doc, headerInput);
    let y = contentStartY;
    const didDrawPage = () => {
      drawPdfHeader(doc, headerInput);
    };

    const linhasComTotal = [
      ...linhas,
      {
        mesLabel: "Total",
        receitasPrevistas: totais.receitasPrevistas,
        receitasRecebidas: totais.receitasRecebidas,
        custosPrevistos: totais.custosPrevistos,
        custosPagos: totais.custosPagos,
        saldoPrevisto: totais.saldoPrevisto,
        saldoRealizado: totais.saldoRealizado,
      },
    ];

    const resumoRows = [
      { label: "Receitas (previstas)", value: totais.receitasPrevistas, kind: "receita" },
      { label: "Receitas (recebidas)", value: totais.receitasRecebidas, kind: "receita" },
      { label: "Custos (previstos)", value: totais.custosPrevistos, kind: "custo" },
      { label: "Custos (pagos)", value: totais.custosPagos, kind: "custo" },
      { label: "Saldo (previsto)", value: totais.saldoPrevisto, kind: "saldo" },
      { label: "Saldo (realizado)", value: totais.saldoRealizado, kind: "saldo" },
    ] as Array<{ label: string; value: number; kind: "receita" | "custo" | "saldo" }>;

    autoTable(doc, {
      startY: y,
      columns: [
        { header: "Resumo", dataKey: "label" },
        { header: "Valor", dataKey: "value" },
      ],
      body: resumoRows,
      theme: "grid",
      margin: { top: contentStartY, left: marginX, right: marginX, bottom: 40 },
      styles: { fontSize: 10, cellPadding: 8, textColor: [17, 24, 39] },
      headStyles: { fillColor: [241, 245, 249], textColor: [17, 24, 39], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 260 },
        1: { halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section !== "body") return;

        const row = data.row?.raw as { label: string; value: number; kind: "receita" | "custo" | "saldo" } | undefined;
        if (!row) return;

        if (data.column.dataKey === "value") {
          data.cell.text = [formatCurrency(row.value)];

          if (row.kind === "receita") {
            data.cell.styles.textColor = PDF_COLOR_RECEITAS;
          } else if (row.kind === "custo") {
            data.cell.styles.textColor = PDF_COLOR_CUSTOS;
          } else {
            data.cell.styles.textColor = row.value < 0 ? PDF_COLOR_CUSTOS : PDF_COLOR_SALDO;
            data.cell.styles.fontStyle = "bold";
          }
        } else {
          if (row.kind === "saldo") {
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage,
    });

    const afterResumoY = (doc as PdfDoc).lastAutoTable?.finalY ?? y;
    y = afterResumoY + 26;

    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text("Detalhamento mensal", marginX, y);
    y += 12;

    autoTable(doc, {
      startY: y,
      columns: [
        { header: "Mês", dataKey: "mesLabel" },
        { header: "Receitas (prev.)", dataKey: "receitasPrevistas" },
        { header: "Receitas (rec.)", dataKey: "receitasRecebidas" },
        { header: "Custos (prev.)", dataKey: "custosPrevistos" },
        { header: "Custos (pag.)", dataKey: "custosPagos" },
        { header: "Saldo (prev.)", dataKey: "saldoPrevisto" },
        { header: "Saldo (real.)", dataKey: "saldoRealizado" },
      ],
      body: linhasComTotal,
      theme: "grid",
      margin: { top: contentStartY, left: marginX, right: marginX, bottom: 40 },
      styles: { fontSize: 8.5, cellPadding: 5, textColor: [17, 24, 39] },
      headStyles: { fillColor: [241, 245, 249], textColor: [17, 24, 39], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section !== "body") return;

        const row = data.row?.raw as LinhaFluxoCaixa | undefined;
        if (!row) return;

        const isTotal = row.mesLabel === "Total";
        if (isTotal) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [243, 244, 246];
        }

        const key = data.column.dataKey as keyof LinhaFluxoCaixa;
        if (key === "mesLabel") return;

        const rawValue = row[key];
        if (typeof rawValue === "number") {
          data.cell.text = [formatCurrency(rawValue)];
        }

        if (key === "receitasPrevistas" || key === "receitasRecebidas") {
          data.cell.styles.textColor = PDF_COLOR_RECEITAS;
        } else if (key === "custosPrevistos" || key === "custosPagos") {
          data.cell.styles.textColor = PDF_COLOR_CUSTOS;
        } else if (key === "saldoPrevisto" || key === "saldoRealizado") {
          data.cell.styles.textColor = rawValue < 0 ? PDF_COLOR_CUSTOS : PDF_COLOR_SALDO;
        }
      },
      didDrawPage,
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i += 1) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginX, doc.internal.pageSize.getHeight() - 24, {
        align: "right",
      });
    }

    const safeLabel = periodoLabel.replace(/\//g, "-").replace(/\s+/g, "_");
    doc.save(`fluxo_caixa_${safeLabel}.pdf`);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h2>
        <Button onClick={exportarPdf} disabled={loading} className="gap-2">
          <FileText className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <Label>Escritório</Label>
              <Select value={escritorio} onValueChange={setEscritorio}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingEscritorios ? "Carregando..." : "Selecione"} />
                </SelectTrigger>
                <SelectContent>
                  {escritoriosOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de período</Label>
              <Select value={tipoPeriodo} onValueChange={(v) => setTipoPeriodo(v as PeriodoTipo)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="intervalo">Intervalo de meses</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ano</Label>
              <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {anosDisponiveis.map(a => (
                    <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tipoPeriodo === "mensal" && (
              <div>
                <Label>Mês</Label>
                <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((m, idx) => (
                      <SelectItem key={m} value={String(idx + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tipoPeriodo === "intervalo" && (
              <>
                <div>
                  <Label>Mês início</Label>
                  <Select value={String(mesInicio)} onValueChange={(v) => setMesInicio(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Início" />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES.map((m, idx) => (
                        <SelectItem key={m} value={String(idx + 1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mês fim</Label>
                  <Select value={String(mesFim)} onValueChange={(v) => setMesFim(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fim" />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES.map((m, idx) => (
                        <SelectItem key={m} value={String(idx + 1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {tipoPeriodo === "trimestral" && (
              <div>
                <Label>Trimestre</Label>
                <Select value={String(trimestre)} onValueChange={(v) => setTrimestre(Number(v) as 1 | 2 | 3 | 4)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Trimestre</SelectItem>
                    <SelectItem value="2">2º Trimestre</SelectItem>
                    <SelectItem value="3">3º Trimestre</SelectItem>
                    <SelectItem value="4">4º Trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {tipoPeriodo === "semestral" && (
              <div>
                <Label>Semestre</Label>
                <Select value={String(semestre)} onValueChange={(v) => setSemestre(Number(v) as 1 | 2)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Semestre</SelectItem>
                    <SelectItem value="2">2º Semestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="md:col-span-4">
              <div className="text-sm text-muted-foreground">
                Período selecionado: <span className="font-medium text-foreground">{periodoLabel}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Receitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Previstas</span>
              <span className="font-medium text-emerald-600">{formatCurrency(totais.receitasPrevistas)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recebidas</span>
              <span className="font-medium text-emerald-600">{formatCurrency(totais.receitasRecebidas)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Previstos</span>
              <span className="font-medium text-red-600">{formatCurrency(totais.custosPrevistos)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pagos</span>
              <span className="font-medium text-red-600">{formatCurrency(totais.custosPagos)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Previsto</span>
              <span className={`font-medium ${saldoClassName(totais.saldoPrevisto)}`}>
                {formatCurrency(totais.saldoPrevisto)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Realizado</span>
              <span className={`font-medium ${saldoClassName(totais.saldoRealizado)}`}>
                {formatCurrency(totais.saldoRealizado)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento mensal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right text-emerald-600">Receitas (prev.)</TableHead>
                <TableHead className="text-right text-emerald-600">Receitas (rec.)</TableHead>
                <TableHead className="text-right text-red-600">Custos (prev.)</TableHead>
                <TableHead className="text-right text-red-600">Custos (pag.)</TableHead>
                <TableHead className="text-right text-blue-600">Saldo (prev.)</TableHead>
                <TableHead className="text-right text-blue-600">Saldo (real.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando dados...
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {linhas.map((l) => (
                    <TableRow key={l.mesLabel}>
                      <TableCell>{l.mesLabel}</TableCell>
                      <TableCell className="text-right text-emerald-600">{formatCurrency(l.receitasPrevistas)}</TableCell>
                      <TableCell className="text-right text-emerald-600">{formatCurrency(l.receitasRecebidas)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(l.custosPrevistos)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(l.custosPagos)}</TableCell>
                      <TableCell className={`text-right ${saldoClassName(l.saldoPrevisto)}`}>
                        {formatCurrency(l.saldoPrevisto)}
                      </TableCell>
                      <TableCell className={`text-right ${saldoClassName(l.saldoRealizado)}`}>
                        {formatCurrency(l.saldoRealizado)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-medium">Total</TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      {formatCurrency(totais.receitasPrevistas)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      {formatCurrency(totais.receitasRecebidas)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">{formatCurrency(totais.custosPrevistos)}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">{formatCurrency(totais.custosPagos)}</TableCell>
                    <TableCell className={`text-right font-medium ${saldoClassName(totais.saldoPrevisto)}`}>
                      {formatCurrency(totais.saldoPrevisto)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${saldoClassName(totais.saldoRealizado)}`}>
                      {formatCurrency(totais.saldoRealizado)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
