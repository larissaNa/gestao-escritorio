import { jsPDF } from "jspdf";

export const PDF_LOGO_PATH = "/images/logo2.png";
export const PDF_OFFICE_NAME = "Escritório Dr. Phortus Leonardo Advogados Associados";

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
    reader.readAsDataURL(blob);
  });

export const loadPdfLogoDataUrl = async () => {
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
