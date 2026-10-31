import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatMonthYearPeriod } from "#/lib/utils/month-year";
import {
  formatPercent,
  formatReportDate,
  formatReportDateTime,
  initials,
  limitList,
  pluralize,
  type ReportData,
  type ReportReserveStatus,
  type ReportSpaceStat,
  type ReportUserStat,
  reportFileName,
} from "#/lib/utils/report";

/**
 * PDF do relatório, desenhado direto com jsPDF (texto vetorial, selecionável e nítido).
 * Não usa captura da tela (html2canvas): ela não entende as cores oklch() do Tailwind v4 e gera imagem borrada.
 *
 * Os rankings podem ter empates (vários espaços ou usuários com o mesmo valor): todos aparecem, e as seções
 * quebram de página sozinhas quando a lista é longa.
 *
 * Quando `report.isPreview` é true (período sem reservas) o PDF mantém toda a estrutura com blocos cinza no lugar
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
/** Limite inferior do conteúdo: abaixo dele ficam a margem e o rodapé de cada página. */
const BOTTOM = PAGE_H - 18;
/** Quantos laboratórios empatados têm o nome listado no cartão de resumo (o resto vira "e mais N"). */
const MAX_DISPUTED_NAMES = 3;

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
  doc.text(formatMonthYearPeriod(report.period), MARGIN, 27.5);

  const right = PAGE_W - MARGIN;
  if (report.isPreview) {
    font(doc, 12, "bold");
    ink(doc, COLOR.white);
    doc.text("PRÉVIA", right, 14, { align: "right" });
    font(doc, 7.5);
    ink(doc, COLOR.violet200);
    doc.text("Nenhuma reserva contabilizada no período", right, 19.5, { align: "right" });
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
  const disputed = summary.mostDisputedSpaces;
  const tied = disputed.length > 1;

  // Empate: um nome por linha (até MAX_DISPUTED_NAMES) e, se sobrar, uma linha "e mais N".
  const { visible, hidden } = limitList(disputed, MAX_DISPUTED_NAMES);
  const tiedLines = [
    ...visible.map((space) => ({ text: space.name, muted: false })),
    ...(hidden > 0
      ? [{ text: `e mais ${hidden} ${hidden === 1 ? "laboratório empatado" : "laboratórios empatados"}`, muted: true }]
      : []),
  ];
  const lineHeight = 5;
  const h = tied ? 14 + tiedLines.length * lineHeight + 5 : 27;

  const kpis = [
    {
      label: "Taxa de ocupação média",
      value: summary.averageOccupancyRate === null ? null : formatPercent(summary.averageOccupancyRate),
      caption: "Horários reservados sobre a capacidade",
      color: COLOR.ink,
      size: 18,
      lines: null as typeof tiedLines | null,
    },
    {
      label: "Taxa de ociosidade / no-show",
      value: summary.idleRate === null ? null : formatPercent(summary.idleRate),
      caption: `${pluralize(summary.absentReserves, "reserva ausente", "reservas ausentes")} de ${summary.totalReserves}`,
      color: COLOR.rose600,
      size: 18,
      lines: null,
    },
    {
      label: tied ? "Laboratórios mais disputados" : "Laboratório mais disputado",
      value: preview ? null : (disputed[0]?.name ?? "—"),
      caption: !disputed.length
        ? "Nenhum espaço com reservas no período"
        : `${formatPercent(disputed[0].occupancyRate)} de ocupação${tied ? " cada" : ""}`,
      color: COLOR.violet600,
      size: 14,
      lines: tied ? tiedLines : null,
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

    if (kpi.lines) {
      kpi.lines.forEach((line, lineIndex) => {
        font(doc, line.muted ? 7.5 : 10.5, line.muted ? "normal" : "bold");
        ink(doc, line.muted ? COLOR.muted : kpi.color);
        doc.text(fit(doc, line.text, w - 8), x + 4, y + 14 + lineIndex * lineHeight);
      });

      font(doc, 7);
      ink(doc, COLOR.muted);
      doc.text(fit(doc, kpi.caption, w - 8), x + 4, y + 14 + kpi.lines.length * lineHeight);
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

/** Abre uma página nova quando `needed` mm não cabem mais na atual; devolve o `y` a usar. */
function ensureSpace(doc: jsPDF, y: number, needed: number) {
  if (y + needed <= BOTTOM) return y;
  doc.addPage();
  return MARGIN;
}

type RankingEntry = {
  tag: string;
  color: RGB;
  name?: string;
  percent: number;
  text: string;
  empty: string;
  previewWidth: number;
  /** primeira linha de cada ranking (ganha um respiro maior em cima) */
  groupStart: boolean;
};

function drawRanking(doc: jsPDF, report: ReportData, y: number) {
  const { ranking } = report;
  const preview = report.isPreview;
  const ROW_STEP = 13;
  const GROUP_STEP = 16;

  // evita título solto no fim da página
  y = ensureSpace(doc, y, 18 + 8);
  sectionTitle(
    doc,
    "Ranking de utilização por sala",
    `Percentual de ocupação em ${formatMonthYearPeriod(report.period)}`,
    y,
  );

  const groups: {
    tag: string;
    color: RGB;
    stats: ReportSpaceStat[];
    percent: (stat: ReportSpaceStat) => number;
    text: (stat: ReportSpaceStat) => string;
    empty: string;
    previewWidth: number;
  }[] = [
    {
      tag: "Alta demanda",
      color: COLOR.violet600,
      stats: ranking.highestDemand,
      percent: (stat) => stat.occupancyRate,
      text: (stat) => `${formatPercent(stat.occupancyRate)} de ocupação`,
      empty: "Nenhum espaço teve reservas no período",
      previewWidth: 0.78,
    },
    {
      tag: "Menor demanda",
      color: COLOR.amber500,
      stats: ranking.lowestDemand,
      percent: (stat) => stat.occupancyRate,
      text: (stat) => `${formatPercent(stat.occupancyRate)} de ocupação`,
      empty: "É preciso ao menos dois espaços com demandas diferentes para comparar",
      previewWidth: 0.42,
    },
    {
      tag: "Mais ociosidade",
      color: COLOR.rose500,
      stats: ranking.mostIdle,
      percent: (stat) => stat.idleRate,
      text: (stat) =>
        `${formatPercent(stat.idleRate)} ausentes · ${pluralize(stat.absentReserves, "ausência", "ausências")} em ${stat.totalReserves}`,
      empty: "Nenhuma ausência registrada no período",
      previewWidth: 0.26,
    },
  ];

  // Cada espaço empatado vira uma linha com a própria barra; ranking sem ninguém vira uma linha de aviso.
  const entries = groups.flatMap<RankingEntry>((group) => {
    const base = { tag: group.tag, color: group.color, empty: group.empty, previewWidth: group.previewWidth };
    if (preview || group.stats.length === 0) return [{ ...base, percent: 0, text: "", groupStart: true }];

    return group.stats.map((stat, index) => ({
      ...base,
      name: stat.name,
      percent: group.percent(stat),
      text: group.text(stat),
      groupStart: index === 0,
    }));
  });

  let rowY = y + 18;
  entries.forEach((row, index) => {
    if (index > 0) {
      rowY += row.groupStart ? GROUP_STEP : ROW_STEP;

      // Ranking longo: a linha (texto + barra, ~6 mm abaixo da base) que não cabe continua na página seguinte.
      if (rowY + 6 > BOTTOM) {
        doc.addPage();
        rowY = MARGIN + 4;
      }
    }

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
  });

  return rowY + 7;
}

type UserNumbers = { value: string; label: string; detail: string };

type UserCardConfig = {
  title: string;
  /** Título no plural, usado quando há empate. */
  titlePlural: string;
  users: ReportUserStat[];
  color: RGB;
  background: RGB;
  numbers: (user: ReportUserStat) => UserNumbers;
  empty: string;
};

function drawUsers(doc: jsPDF, report: ReportData, startY: number) {
  const { users } = report;
  const preview = report.isPreview;
  const gap = 4;
  const w = (CONTENT_W - gap) / 2;
  // Altura do cartão = cabeçalho + uma faixa por usuário + respiro (1 usuário = 28 mm).
  const HEAD = 10;
  const ROW = 16;
  const PAD = 2;

  const cards: UserCardConfig[] = [
    {
      title: "Usuário com mais reservas",
      titlePlural: "Usuários com mais reservas",
      users: users.mostReserves,
      color: COLOR.violet700,
      background: COLOR.violet100,
      numbers: (u) => ({
        value: String(u.totalReserves),
        label: u.totalReserves === 1 ? "reserva" : "reservas",
        detail: u.absentReserves > 0 ? pluralize(u.absentReserves, "ausência", "ausências") : "sem ausências",
      }),
      empty: "Nenhuma reserva no período",
    },
    {
      title: "Usuário mais ocioso",
      titlePlural: "Usuários mais ociosos",
      users: users.mostIdle,
      color: COLOR.rose600,
      background: COLOR.rose100,
      numbers: (u) => ({
        value: String(u.absentReserves),
        label: u.absentReserves === 1 ? "ausência" : "ausências",
        detail: `${formatPercent(u.idleRate)} de ${pluralize(u.totalReserves, "reserva", "reservas")}`,
      }),
      empty: "Nenhuma ausência registrada no período",
    },
  ];

  /** Um usuário dentro do cartão: avatar, nome/matrícula à esquerda e os números à direita. */
  function drawUserRow(entry: UserCardConfig, user: ReportUserStat, x: number, top: number) {
    const { value, label, detail } = entry.numbers(user);
    const right = x + w - 4;
    const cx = x + 10;
    const cy = top + 6.5;

    fill(doc, entry.background);
    doc.circle(cx, cy, 4.5, "F");
    font(doc, 8, "bold");
    ink(doc, entry.color);
    doc.text(initials(user.name), cx, cy + 1, { align: "center" });

    font(doc, 16, "bold");
    ink(doc, entry.color);
    doc.text(value, right, top + 5.5, { align: "right" });
    const numberWidth = doc.getTextWidth(value);

    font(doc, 7);
    ink(doc, COLOR.muted);
    doc.text(label, right, top + 9.5, { align: "right" });
    doc.text(detail, right, top + 13, { align: "right" });
    const rightBlock = Math.max(numberWidth, doc.getTextWidth(detail));

    font(doc, 10, "bold");
    ink(doc, COLOR.ink);
    doc.text(fit(doc, user.name, w - 18 - rightBlock - 8), x + 18, top + 6);
    font(doc, 7.5);
    ink(doc, COLOR.muted);
    doc.text(`Matrícula ${user.registration}`, x + 18, top + 11);
  }

  // Usuários empatados ficam um embaixo do outro no mesmo cartão; os dois cartões têm a mesma altura.
  // Se a lista não couber na página, os cartões continuam na seguinte.
  const total = Math.max(1, ...cards.map((c) => c.users.length));
  let y = startY;
  let offset = 0;

  while (offset < total) {
    const remaining = total - offset;
    let fitRows = Math.floor((BOTTOM - y - HEAD - PAD) / ROW);

    if (fitRows < Math.min(remaining, 2)) {
      doc.addPage();
      y = MARGIN;
      fitRows = Math.floor((BOTTOM - y - HEAD - PAD) / ROW);
    }

    const count = Math.min(remaining, fitRows);
    const height = HEAD + count * ROW + PAD;
    const continuation = offset > 0;

    cards.forEach((entry, index) => {
      // Na continuação, o cartão cuja lista já terminou na página anterior não é repetido vazio.
      if (continuation && entry.users.length <= offset) return;

      const x = MARGIN + index * (w + gap);
      card(doc, x, y, w, height, preview);

      const multiple = entry.users.length > 1;
      font(doc, 8);
      ink(doc, COLOR.muted);
      const title = multiple ? entry.titlePlural : entry.title;
      doc.text(continuation ? `${title} (continuação)` : title, x + 4, y + 7);

      if (multiple && !continuation) {
        font(doc, 7, "bold");
        ink(doc, entry.color);
        doc.text(`${entry.users.length} empatados`, x + w - 4, y + 7, { align: "right" });
      }

      if (preview) {
        const cx = x + 10;
        const cy = y + 17;
        fill(doc, COLOR.skeleton);
        doc.circle(cx, cy, 4.5, "F");
        skeletonBar(doc, x + 18, y + 13.5, 40, 3.2);
        skeletonBar(doc, x + 18, y + 19, 26, 2.6);
        skeletonBar(doc, x + w - 18, y + 12.5, 14, 6);
        return;
      }

      if (entry.users.length === 0) {
        font(doc, 9);
        ink(doc, COLOR.muted);
        doc.text(entry.empty, x + 4, y + 18);
        return;
      }

      for (let row = 0; row < count; row++) {
        const user = entry.users[offset + row];
        if (!user) break;

        const top = y + HEAD + row * ROW;
        if (row > 0) {
          stroke(doc, COLOR.line);
          doc.setLineWidth(0.2);
          doc.line(x + 4, top - 1.2, x + w - 4, top - 1.2);
        }
        drawUserRow(entry, user, x, top);
      }
    });

    y += height;
    offset += count;

    if (offset < total) {
      doc.addPage();
      y = MARGIN;
    }
  }

  return y;
}

function drawTable(doc: jsPDF, report: ReportData, startY: number) {
  const preview = report.isPreview;
  let y = startY;

  // evita título solto no fim da página
  if (y > 250) {
    doc.addPage();
    y = MARGIN;
  }

  sectionTitle(doc, "Reservas do período", "Confirmadas e ausentes, sem canceladas nem bloqueios.", y);
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
    doc.text(`Labpoint · Relatório de ocupação · ${formatMonthYearPeriod(report.period)}`, MARGIN, PAGE_H - 9);
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
    title: `Relatório de ocupação - ${formatMonthYearPeriod(report.period)}`,
    subject: report.isPreview ? "Prévia (sem reservas no período)" : "Ocupação e ociosidade dos espaços",
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
