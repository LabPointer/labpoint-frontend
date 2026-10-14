import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatMonthYear } from "#/lib/utils/month-year";
import {
  formatPercent,
  formatReportDate,
  formatReportDateTime,
  initials,
  pluralize,
  type ReportData,
  type ReportReserveStatus,
  type ReportUserStat,
  reportFileName,
} from "#/lib/utils/report";

/**
 * PDF do relatório, desenhado direto com jsPDF (texto vetorial, selecionável e nítido).
 * Não usa captura da tela (html2canvas): ela não entende as cores oklch() do Tailwind v4 e gera imagem borrada.
 *
 * Quando `report.isPreview` é true (mês sem reservas) o PDF mantém toda a estrutura com blocos cinza no lugar
 * dos números e a marca "PRÉVIA", espelhando o esqueleto mostrado na tela.
 */

type RGB = [number, number, number];

const COLOR = {
  violet700: [109, 40, 217] as RGB,
  violet600: [124, 58, 237] as RGB,
  violet200: [221, 214, 254] as RGB,
  violet100: [237, 233, 254] as RGB,
  ink: [23, 23, 23] as RGB,
  muted: [115, 115, 115] as RGB,
  line: [229, 229, 229] as RGB,
  zebra: [250, 250, 252] as RGB,
  track: [240, 240, 243] as RGB,
  skeleton: [229, 231, 235] as RGB,
  skeletonDark: [209, 213, 219] as RGB,
  white: [255, 255, 255] as RGB,
  emerald600: [5, 150, 105] as RGB,
  rose600: [225, 29, 72] as RGB,
  rose500: [244, 63, 94] as RGB,
  rose100: [255, 228, 230] as RGB,
  amber500: [245, 158, 11] as RGB,
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;
const SECTION_GAP = 8;

const STATUS_LABEL: Record<ReportReserveStatus, string> = { CONFIRMED: "Confirmada", ABSENT: "Ausente" };

// ---------------------------------------------------------------------------
// Helpers de desenho
// ---------------------------------------------------------------------------

const fill = (doc: jsPDF, c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
const stroke = (doc: jsPDF, c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
const ink = (doc: jsPDF, c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

function font(doc: jsPDF, size: number, style: "normal" | "bold" = "normal") {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
}

/** Corta o texto com "..." para caber em `maxWidth` (usa a fonte atual). */
function fit(doc: jsPDF, text: string, maxWidth: number) {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && doc.getTextWidth(`${out}...`) > maxWidth) out = out.slice(0, -1);
  return `${out.trimEnd()}...`;
}

/** Bloco cinza no lugar de um valor (esqueleto). */
function skeletonBar(doc: jsPDF, x: number, y: number, w: number, h: number, color: RGB = COLOR.skeleton) {
  fill(doc, color);
  doc.roundedRect(x, y, w, h, Math.min(h / 2, 1.5), Math.min(h / 2, 1.5), "F");
}

/** Cartão com borda fina; tracejada na prévia. */
function card(doc: jsPDF, x: number, y: number, w: number, h: number, preview: boolean) {
  stroke(doc, preview ? COLOR.violet200 : COLOR.line);
  doc.setLineWidth(0.3);
  if (preview) doc.setLineDashPattern([1.5, 1.2], 0);
  doc.roundedRect(x, y, w, h, 2, 2, "S");
  if (preview) doc.setLineDashPattern([], 0);
}

function sectionTitle(doc: jsPDF, title: string, subtitle: string, y: number) {
  font(doc, 11, "bold");
  ink(doc, COLOR.ink);
  doc.text(title, MARGIN, y + 4);
  font(doc, 8);
  ink(doc, COLOR.muted);
  doc.text(subtitle, MARGIN, y + 9);
}

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------

function drawWatermark(doc: jsPDF) {
  font(doc, 96, "bold");
  ink(doc, COLOR.violet100);
  doc.text("PRÉVIA", PAGE_W / 2, 170, { align: "center", angle: 35 });
}

function drawHeader(doc: jsPDF, report: ReportData) {
  const height = 34;
  fill(doc, COLOR.violet700);
  doc.rect(0, 0, PAGE_W, height, "F");

  font(doc, 8, "bold");
  ink(doc, COLOR.violet200);
  doc.text("LABPOINT", MARGIN, 10);

  font(doc, 19, "bold");
  ink(doc, COLOR.white);
  doc.text("Relatório de Ocupação", MARGIN, 20);

  font(doc, 10.5);
  ink(doc, COLOR.violet200);
  doc.text(formatMonthYear(report.period), MARGIN, 27.5);

  const right = PAGE_W - MARGIN;
  if (report.isPreview) {
    font(doc, 12, "bold");
    ink(doc, COLOR.white);
    doc.text("PRÉVIA", right, 14, { align: "right" });
    font(doc, 7.5);
    ink(doc, COLOR.violet200);
    doc.text("Nenhuma reserva contabilizada no mês", right, 19.5, { align: "right" });
  } else {
    font(doc, 8);
    ink(doc, COLOR.violet200);
    if (report.generatedAt)
      doc.text(`Dados de ${formatReportDateTime(report.generatedAt)}`, right, 14, { align: "right" });
    doc.text(pluralize(report.reserves.length, "reserva contabilizada", "reservas contabilizadas"), right, 19.5, {
      align: "right",
    });
  }

  return height;
}

function drawKpis(doc: jsPDF, report: ReportData, y: number) {
  const { summary } = report;
  const preview = report.isPreview;
  const gap = 4;
  const w = (CONTENT_W - gap * 2) / 3;
  const h = 27;
  const disputed = summary.mostDisputedSpace;

  const kpis = [
    {
      label: "Taxa de ocupação média",
      value: summary.averageOccupancyRate === null ? null : formatPercent(summary.averageOccupancyRate),
      caption: "Horários reservados sobre a capacidade",
      color: COLOR.ink,
      size: 18,
    },
    {
      label: "Taxa de ociosidade / no-show",
      value: summary.idleRate === null ? null : formatPercent(summary.idleRate),
      caption: `${pluralize(summary.absentReserves, "reserva ausente", "reservas ausentes")} de ${summary.totalReserves}`,
      color: COLOR.rose600,
      size: 18,
    },
    {
      label: "Laboratório mais disputado",
      value: preview ? null : (disputed?.name ?? "—"),
      caption: disputed ? `${formatPercent(disputed.occupancyRate)} de ocupação` : "Nenhum espaço com reservas no mês",
      color: COLOR.violet600,
      size: 14,
    },
  ];

  kpis.forEach((kpi, index) => {
    const x = MARGIN + index * (w + gap);
    card(doc, x, y, w, h, preview);

    font(doc, 8);
    ink(doc, COLOR.muted);
    doc.text(kpi.label, x + 4, y + 7);

    if (kpi.value === null) {
      skeletonBar(doc, x + 4, y + 11, 30, 6.5);
      skeletonBar(doc, x + 4, y + 20.5, 42, 2.6);
      return;
    }

    font(doc, kpi.size, "bold");
    ink(doc, kpi.color);
    doc.text(fit(doc, kpi.value, w - 8), x + 4, y + 17);

    font(doc, 7);
    ink(doc, COLOR.muted);
    doc.text(fit(doc, kpi.caption, w - 8), x + 4, y + 22.5);
  });

  return y + h;
}

function drawRanking(doc: jsPDF, report: ReportData, y: number) {
  const { ranking } = report;
  const preview = report.isPreview;

  sectionTitle(doc, "Ranking de utilização por sala", `Percentual de ocupação em ${formatMonthYear(report.period)}`, y);

  const rows = [
    {
      tag: "Alta demanda",
      color: COLOR.violet600,
      name: ranking.highestDemand?.name,
      percent: ranking.highestDemand?.occupancyRate ?? 0,
      text: ranking.highestDemand ? `${formatPercent(ranking.highestDemand.occupancyRate)} de ocupação` : "",
      empty: "Nenhum espaço teve reservas no mês",
      previewWidth: 0.78,
    },
    {
      tag: "Menor demanda",
      color: COLOR.amber500,
      name: ranking.lowestDemand?.name,
      percent: ranking.lowestDemand?.occupancyRate ?? 0,
      text: ranking.lowestDemand ? `${formatPercent(ranking.lowestDemand.occupancyRate)} de ocupação` : "",
      empty: "É preciso ao menos dois espaços para comparar",
      previewWidth: 0.42,
    },
    {
      tag: "Mais ociosidade",
      color: COLOR.rose500,
      name: ranking.mostIdle?.name,
      percent: ranking.mostIdle?.idleRate ?? 0,
      text: ranking.mostIdle
        ? `${formatPercent(ranking.mostIdle.idleRate)} ausentes · ${pluralize(ranking.mostIdle.absentReserves, "ausência", "ausências")} em ${ranking.mostIdle.totalReserves}`
        : "",
      empty: "Nenhuma ausência registrada no mês",
      previewWidth: 0.26,
    },
  ];

  let rowY = y + 18;
  for (const row of rows) {
    const barY = rowY + 2.2;

    if (preview) {
      font(doc, 9, "bold");
      ink(doc, row.color);
      doc.text(row.tag, MARGIN, rowY);
      skeletonBar(doc, PAGE_W - MARGIN - 34, rowY - 2.8, 34, 3);
    } else {
      font(doc, 8);
      const rightText = row.name ? row.text : row.empty;
      ink(doc, COLOR.muted);
      doc.text(rightText, PAGE_W - MARGIN, rowY, { align: "right" });
      const rightWidth = doc.getTextWidth(rightText);

      const tagText = `(${row.tag})`;
      const tagWidth = doc.getTextWidth(tagText);
      font(doc, 9, "bold");
      ink(doc, COLOR.ink);
      const name = fit(doc, row.name ?? "—", CONTENT_W - rightWidth - tagWidth - 10);
      doc.text(name, MARGIN, rowY);
      const nameWidth = doc.getTextWidth(name);

      font(doc, 8);
      ink(doc, row.color);
      doc.text(tagText, MARGIN + nameWidth + 1.5, rowY);
    }

    fill(doc, COLOR.track);
    doc.roundedRect(MARGIN, barY, CONTENT_W, 3, 1.5, 1.5, "F");

    if (preview) {
      skeletonBar(doc, MARGIN, barY, CONTENT_W * row.previewWidth, 3, COLOR.skeletonDark);
    } else if (row.name && row.percent > 0) {
      fill(doc, row.color);
      const width = Math.max(3, (Math.min(row.percent, 100) / 100) * CONTENT_W);
      doc.roundedRect(MARGIN, barY, width, 3, 1.5, 1.5, "F");
    }

    rowY += 13;
  }

  return rowY - 6;
}

function drawUsers(doc: jsPDF, report: ReportData, y: number) {
  const { users } = report;
  const preview = report.isPreview;
  const gap = 4;
  const w = (CONTENT_W - gap) / 2;
  const h = 27;

  type Numbers = { value: string; label: string; detail: string };
  const cards: {
    title: string;
    user: ReportUserStat | null;
    color: RGB;
    background: RGB;
    numbers: (user: ReportUserStat) => Numbers;
    empty: string;
  }[] = [
    {
      title: "Usuário com mais reservas",
      user: users.mostReserves,
      color: COLOR.violet700,
      background: COLOR.violet100,
      numbers: (u) => ({
        value: String(u.totalReserves),
        label: u.totalReserves === 1 ? "reserva" : "reservas",
        detail: u.absentReserves > 0 ? pluralize(u.absentReserves, "ausência", "ausências") : "sem ausências",
      }),
      empty: "Nenhuma reserva no mês",
    },
    {
      title: "Usuário mais ocioso",
      user: users.mostIdle,
      color: COLOR.rose600,
      background: COLOR.rose100,
      numbers: (u) => ({
        value: String(u.absentReserves),
        label: u.absentReserves === 1 ? "ausência" : "ausências",
        detail: `${formatPercent(u.idleRate)} de ${pluralize(u.totalReserves, "reserva", "reservas")}`,
      }),
      empty: "Nenhuma ausência registrada no mês",
    },
  ];

  cards.forEach((entry, index) => {
    const x = MARGIN + index * (w + gap);
    card(doc, x, y, w, h, preview);

    font(doc, 8);
    ink(doc, COLOR.muted);
    doc.text(entry.title, x + 4, y + 7);

    const cx = x + 10;
    const cy = y + 17;

    if (preview) {
      fill(doc, COLOR.skeleton);
      doc.circle(cx, cy, 4.5, "F");
      skeletonBar(doc, x + 18, y + 13.5, 40, 3.2);
      skeletonBar(doc, x + 18, y + 19, 26, 2.6);
      skeletonBar(doc, x + w - 18, y + 12.5, 14, 6);
      return;
    }

    const user = entry.user;
    if (!user) {
      font(doc, 9);
      ink(doc, COLOR.muted);
      doc.text(entry.empty, x + 4, y + 18);
      return;
    }

    const { value, label, detail } = entry.numbers(user);
    const right = x + w - 4;

    fill(doc, entry.background);
    doc.circle(cx, cy, 4.5, "F");
    font(doc, 8, "bold");
    ink(doc, entry.color);
    doc.text(initials(user.name), cx, cy + 1, { align: "center" });

    font(doc, 16, "bold");
    ink(doc, entry.color);
    doc.text(value, right, y + 15.5, { align: "right" });
    const numberWidth = doc.getTextWidth(value);

    font(doc, 7);
    ink(doc, COLOR.muted);
    doc.text(label, right, y + 19.5, { align: "right" });
    doc.text(detail, right, y + 23.2, { align: "right" });
    const rightBlock = Math.max(numberWidth, doc.getTextWidth(detail));

    font(doc, 10, "bold");
    ink(doc, COLOR.ink);
    doc.text(fit(doc, user.name, w - 18 - rightBlock - 8), x + 18, y + 16);
    font(doc, 7.5);
    ink(doc, COLOR.muted);
    doc.text(`Matrícula ${user.registration}`, x + 18, y + 21);
  });

  return y + h;
}

function drawTable(doc: jsPDF, report: ReportData, startY: number) {
  const preview = report.isPreview;
  let y = startY;

  // evita título solto no fim da página
  if (y > 250) {
    doc.addPage();
    y = MARGIN;
  }

  sectionTitle(doc, "Reservas do mês", "Confirmadas e ausentes, sem canceladas nem bloqueios.", y);
  if (!preview) {
    font(doc, 8, "bold");
    ink(doc, COLOR.ink);
    doc.text(pluralize(report.reserves.length, "reserva", "reservas"), PAGE_W - MARGIN, y + 4, { align: "right" });
  }

  const body = preview
    ? Array.from({ length: 5 }, () => ["", "", "", "", ""])
    : report.reserves.map((reserve) => [
        reserve.spaceName,
        reserve.userName,
        formatReportDate(reserve.dateFrom),
        formatReportDate(reserve.dateTo),
        STATUS_LABEL[reserve.status],
      ]);

  const skeletonWidths = [0.55, 0.65, 0.6, 0.6, 0.5];

  autoTable(doc, {
    startY: y + 13,
    head: [["Sala", "Usuário", "Início", "Fim", "Status"]],
    body,
    theme: "grid",
    margin: { left: MARGIN, right: MARGIN, bottom: 18 },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 2.4, bottom: 2.4, left: 2.5, right: 2.5 },
      lineColor: COLOR.line,
      lineWidth: 0.1,
      textColor: COLOR.ink,
      overflow: "linebreak",
    },
    headStyles: { fillColor: COLOR.violet700, textColor: COLOR.white, fontStyle: "bold" },
    alternateRowStyles: { fillColor: COLOR.zebra },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 52 },
      2: { cellWidth: 24, halign: "center" },
      3: { cellWidth: 24, halign: "center" },
      4: { cellWidth: 36, halign: "center" },
    },
    didParseCell: (data) => {
      if (preview || data.section !== "body" || data.column.index !== 4) return;
      data.cell.styles.fontStyle = "bold";
      data.cell.styles.textColor = data.cell.raw === STATUS_LABEL.ABSENT ? COLOR.rose600 : COLOR.emerald600;
    },
    didDrawCell: (data) => {
      if (!preview || data.section !== "body") return;
      const width = (data.cell.width - 5) * skeletonWidths[data.column.index];
      const x = data.column.index >= 2 ? data.cell.x + (data.cell.width - width) / 2 : data.cell.x + 2.5;
      skeletonBar(doc, x, data.cell.y + data.cell.height / 2 - 1.2, width, 2.4);
    },
  });
}

/** "Página X de Y" em todas as páginas, depois que o total é conhecido. */
function drawFooters(doc: jsPDF, report: ReportData) {
  const pages = doc.getNumberOfPages();

  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    stroke(doc, COLOR.line);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);

    font(doc, 7.5);
    ink(doc, COLOR.muted);
    doc.text(`Labpoint · Relatório de ocupação · ${formatMonthYear(report.period)}`, MARGIN, PAGE_H - 9);
    doc.text(`Página ${page} de ${pages}`, PAGE_W - MARGIN, PAGE_H - 9, { align: "right" });
  }
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/** Monta o documento sem salvar (útil para testar). */
export function buildReportPdf(report: ReportData) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.setProperties({
    title: `Relatório de ocupação - ${formatMonthYear(report.period)}`,
    subject: report.isPreview ? "Prévia (sem reservas no mês)" : "Ocupação e ociosidade dos espaços",
    creator: "Labpoint",
  });

  // A marca d'água vai primeiro para ficar atrás do conteúdo.
  if (report.isPreview) drawWatermark(doc);

  let y = drawHeader(doc, report) + SECTION_GAP;
  y = drawKpis(doc, report, y) + SECTION_GAP;
  y = drawRanking(doc, report, y) + SECTION_GAP;
  y = drawUsers(doc, report, y) + SECTION_GAP;
  drawTable(doc, report, y);
  drawFooters(doc, report);

  return doc;
}

/** Gera e baixa o PDF (executa só no navegador). */
export function exportReportPdf(report: ReportData) {
  buildReportPdf(report).save(reportFileName(report.period));
}
