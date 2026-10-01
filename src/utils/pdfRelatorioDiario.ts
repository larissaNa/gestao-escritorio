import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RelatorioDiarioItem } from '@/model/entities';

const PDF_LOGO_PATH = '/images/logo2.png';
const PDF_OFFICE_NAME = 'Escritório Dr. Phortus Leonardo Advogados Associados';

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Falha ao ler imagem'));
    reader.readAsDataURL(blob);
  });

export const loadPdfLogoDataUrl = async (): Promise<string | null> => {
  try {
    const res = await fetch(PDF_LOGO_PATH);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
};

export const drawPdfHeader = (
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
    try {
      doc.addImage(input.logoDataUrl, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
    } catch {
      // Ignore if image format issue
    }
  }

  const textX = input.logoDataUrl ? logoX + logoW + 12 : logoX;
  const rightX = pageWidth - marginX - 12;
  const maxTextWidth = rightX - textX;

  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(PDF_OFFICE_NAME, maxTextWidth), textX, headerTop + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(doc.splitTextToSize(input.title, maxTextWidth), textX, headerTop + 46);

  if (input.rightText) {
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(input.rightText, rightX, headerTop + 20, { align: 'right' });
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, headerTop + headerHeight, pageWidth - marginX, headerTop + headerHeight);

  return { marginX, contentStartY: headerTop + headerHeight + 18 };
};

export interface ExportarDiarioPdfOptions {
  items: RelatorioDiarioItem[];
  filtroResponsavelNome?: string;
  periodoLabel?: string;
  fileName?: string;
}

export const gerarPdfRelatorioDiario = async (options: ExportarDiarioPdfOptions) => {
  const { items, filtroResponsavelNome, periodoLabel, fileName } = options;
  if (!items || items.length === 0) return;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const nowLabel = new Date().toLocaleString('pt-BR');
  const logoDataUrl = await loadPdfLogoDataUrl();

  const headerInput = {
    title: 'Relatório Diário - Diário de Bordo',
    rightText: `Gerado em: ${nowLabel}`,
    logoDataUrl,
  };

  const { marginX, contentStartY } = drawPdfHeader(doc, headerInput);

  const didDrawPage = () => {
    drawPdfHeader(doc, headerInput);
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - marginX * 2;
  let y = contentStartY;

  // Metadata / Filters
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  if (filtroResponsavelNome) {
    const respLines = doc.splitTextToSize(`Responsável: ${filtroResponsavelNome}`, contentWidth);
    doc.text(respLines, marginX, y);
    y += respLines.length * 14;
  }

  if (periodoLabel) {
    const perLines = doc.splitTextToSize(`Período: ${periodoLabel}`, contentWidth);
    doc.text(perLines, marginX, y);
    y += perLines.length * 14;
  }

  const totalLines = doc.splitTextToSize(`Total de registros: ${items.length}`, contentWidth);
  doc.text(totalLines, marginX, y);
  y += totalLines.length * 14 + 10;

  // Tabela
  const tableBody = items.map((item) => {
    const dataFormatada = item.data instanceof Date ? item.data.toLocaleDateString('pt-BR') : '';
    return [dataFormatada, item.responsavelNome || 'Estagiário', item.descricao || ''];
  });

  autoTable(doc, {
    startY: y,
    head: [['Data', 'Responsável', 'Descrição das Atividades']],
    body: tableBody,
    styles: {
      fontSize: 10,
      cellPadding: 6,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 120 },
      2: { cellWidth: contentWidth - 190 },
    },
    theme: 'grid',
    margin: { top: contentStartY, left: marginX, right: marginX, bottom: 40 },
    didDrawPage,
  });

  const finalFileName = fileName || `Relatorio_Diario_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(finalFileName);
};
