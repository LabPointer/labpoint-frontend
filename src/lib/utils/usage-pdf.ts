import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { hhmm, shiftLabels, sortSchedules } from "#/lib/queries/schedules";
import { hasCheckIn, modalityLabel, type UsageSession, usageStatusLabel } from "#/lib/queries/usage";

/**
 * PDF dos relatórios de uso (folha "Controle de uso diário"), desenhado com jsPDF como o PDF dos relatórios mensais
 * (texto vetorial e nítido). Cada grupo é uma reserva (ou a seleção do Gerenciar check-out); cada sessão vira um
 * bloco com o cabeçalho (sala, professor, data, turno, horários) e a tabela de horários com notebooks e fontes.
 */

type RGB = [number, number, number];

const COLOR = {
  violet700: [109, 40, 217] as RGB,
  violet200: [221, 214, 254] as RGB,
  violet50: [245, 243, 255] as RGB,
  ink: [23, 23, 23] as RGB,
  muted: [115, 115, 115] as RGB,
  line: [229, 229, 229] as RGB,
  zebra: [250, 250, 252] as RGB,
  white: [255, 255, 255] as RGB,
  rose600: [225, 29, 72] as RGB,
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM = PAGE_H - 20;

/** Um grupo de sessões com título próprio (ex.: uma reserva). */
export type UsagePdfGroup = { title: string; subtitle?: string; sessions: UsageSession[] };

const fill = (doc: jsPDF, c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
const stroke = (doc: jsPDF, c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
const ink = (doc: jsPDF, c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

function font(doc: jsPDF, size: number, style: "normal" | "bold" = "normal") {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
}

const fmtDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};
const fmtInstant = (instant: string) => format(new Date(instant), "dd/MM/yyyy HH:mm");
const count = (value: number | string | null | undefined) =>
  value === null || value === undefined ? "—" : String(value);
const place = (session: UsageSession) => session.spaceName ?? session.resources[0]?.name ?? "Reserva";

function ensureSpace(doc: jsPDF, y: number, needed: number) {
  if (y + needed <= BOTTOM) return y;
  doc.addPage();
  return MARGIN;
}

function drawHeader(doc: jsPDF, title: string, subtitle: string) {
  const height = 30;
  fill(doc, COLOR.violet700);
  doc.rect(0, 0, PAGE_W, height, "F");
  font(doc, 8, "bold");
  ink(doc, COLOR.violet200);
  doc.text("LABPOINT", MARGIN, 10);
  font(doc, 18, "bold");
  ink(doc, COLOR.white);
  doc.text(title, MARGIN, 19);
  font(doc, 10);
  ink(doc, COLOR.violet200);
  doc.text(doc.splitTextToSize(subtitle, CONTENT_W - 50)[0] ?? "", MARGIN, 25.5);
  font(doc, 8);
  doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}`, PAGE_W - MARGIN, 10, { align: "right" });
  return height;
}

function drawGroupTitle(doc: jsPDF, group: UsagePdfGroup, startY: number) {
  let y = ensureSpace(doc, startY, 24);
  font(doc, 12, "bold");
  ink(doc, COLOR.ink);
  doc.text(group.title, MARGIN, y + 5);
  if (group.subtitle) {
    font(doc, 8.5);
    ink(doc, COLOR.muted);
    const lines = doc.splitTextToSize(group.subtitle, CONTENT_W);
    doc.text(lines, MARGIN, y + 10);
    y += 4 * lines.length;
  }
  return y + 13;
}

function drawSession(doc: jsPDF, session: UsageSession, startY: number) {
  let y = ensureSpace(doc, startY, 40);
  const status = Number(session.status);
  const shift = shiftLabels[Number(session.shift)] ?? "—";
  const schedules = sortSchedules(session.schedules);

  // faixa com o título da sessão
  fill(doc, COLOR.violet50);
  stroke(doc, COLOR.violet200);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT_W, 8, 1.5, 1.5, "FD");
  font(doc, 9.5, "bold");
  ink(doc, COLOR.ink);
  doc.text(`${place(session)} · ${fmtDate(session.date)} · ${shift}`, MARGIN + 3, y + 5.4);
  font(doc, 8.5, "bold");
  ink(doc, COLOR.violet700);
  doc.text(usageStatusLabel(status), PAGE_W - MARGIN - 3, y + 5.4, { align: "right" });
  y += 12;

  const info: [string, string][] = [
    ["Professor(a)", `${session.account.userName ?? "Sem nome"} (${session.account.registration})`],
    ["Horários", schedules.map((s) => `${hhmm(s.startAt)} às ${hhmm(s.endAt)}`).join(" · ") || "—"],
  ];
  if (session.resources.length > 0)
    info.push(["Recursos", session.resources.map((r) => `${r.name} × ${r.quantity}`).join(", ")]);
  info.push([
    "Check-in / check-out",
    `${session.checkedInAt ? fmtInstant(session.checkedInAt) : "—"} / ${
      session.checkedOutAt ? fmtInstant(session.checkedOutAt) : "—"
    }${session.checkedOutBy ? ` (encerrado por ${session.checkedOutBy.userName ?? "coordenação"})` : ""}`,
  ]);

  for (const [label, value] of info) {
    font(doc, 8.5, "bold");
    ink(doc, COLOR.ink);
    doc.text(label, MARGIN, y);
    font(doc, 8.5);
    const lines = doc.splitTextToSize(value, CONTENT_W - 38);
    doc.text(lines, MARGIN + 38, y);
    y += 4.5 * lines.length;
  }

  if (!hasCheckIn(status)) {
    font(doc, 8.5);
    ink(doc, COLOR.muted);
    doc.text(
      status === 3 ? "Sem check-in no prazo: o turno foi marcado como ausente." : "Aguardando o check-in.",
      MARGIN,
      y + 2,
    );
    return y + 10;
  }

  const entries = new Map(session.entries.map((entry) => [Number(entry.scheduleId), entry]));
  const body = schedules.map((schedule) => {
    const entry = entries.get(Number(schedule.id));
    const label = `${hhmm(schedule.startAt)} às ${hhmm(schedule.endAt)}`;
    return entry
      ? [
          label,
          entry.className,
          modalityLabel(entry.modality),
          count(entry.notebooksIn),
          count(entry.chargersIn),
          count(entry.notebooksOut),
          count(entry.chargersOut),
        ]
      : [label, "Não preenchido", "", "", "", "", ""];
  });

  autoTable(doc, {
    startY: y + 1,
    head: [
      [
        { content: "Horário", rowSpan: 2 },
        { content: "Turma", rowSpan: 2 },
        { content: "Modalidade", rowSpan: 2 },
        { content: "Entrada", colSpan: 2, styles: { halign: "center" } },
        { content: "Saída", colSpan: 2, styles: { halign: "center" } },
      ],
      ["Notebooks", "Fontes", "Notebooks", "Fontes"],
    ],
    body,
    theme: "grid",
    margin: { left: MARGIN, right: MARGIN, bottom: 20 },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      lineColor: COLOR.line,
      lineWidth: 0.1,
      textColor: COLOR.ink,
      valign: "middle",
    },
    headStyles: { fillColor: COLOR.violet700, textColor: COLOR.white, fontStyle: "bold", valign: "middle" },
    alternateRowStyles: { fillColor: COLOR.zebra },
    columnStyles: {
      0: { cellWidth: 30 },
      3: { halign: "center", cellWidth: 20 },
      4: { halign: "center", cellWidth: 17 },
      5: { halign: "center", cellWidth: 20 },
      6: { halign: "center", cellWidth: 17 },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const row = body[data.row.index];
      // saída diferente da entrada em destaque, como na tela
      const mismatch = row[5] !== "" && row[5] !== "—" && (row[5] !== row[3] || row[6] !== row[4]);
      if (mismatch && data.column.index >= 5) {
        data.cell.styles.textColor = COLOR.rose600;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // biome-ignore lint/suspicious/noExplicitAny: lastAutoTable é adicionado pelo jspdf-autotable em tempo de execução
  return ((doc as any).lastAutoTable?.finalY ?? y) + 9;
}

function drawFooters(doc: jsPDF, label: string) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    stroke(doc, COLOR.line);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
    font(doc, 7.5);
    ink(doc, COLOR.muted);
    doc.text(`Labpoint · ${label}`, MARGIN, PAGE_H - 9);
    doc.text(`Página ${page} de ${pages}`, PAGE_W - MARGIN, PAGE_H - 9, { align: "right" });
  }
}

/** Monta o PDF (sem salvar). `subtitle` descreve o conteúdo (ex.: a reserva ou "3 sessões selecionadas"). */
export function buildUsagePdf(groups: UsagePdfGroup[], subtitle: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.setProperties({ title: `Relatório de uso - ${subtitle}`, creator: "Labpoint" });

  let y = drawHeader(doc, "Relatório de uso", subtitle) + 8;
  for (const group of groups) {
    y = drawGroupTitle(doc, group, y);
    if (group.sessions.length === 0) {
      font(doc, 8.5);
      ink(doc, COLOR.muted);
      doc.text("Ainda não há uso registrado para esta reserva.", MARGIN, y);
      y += 10;
      continue;
    }
    for (const session of group.sessions) y = drawSession(doc, session, y);
    y += 2;
  }
  drawFooters(doc, `Relatório de uso · ${subtitle}`);
  return doc;
}

/** Gera e baixa o PDF (executa só no navegador). */
export function exportUsagePdf(groups: UsagePdfGroup[], subtitle: string, fileName: string) {
  buildUsagePdf(groups, subtitle).save(`${fileName}.pdf`);
}

/** Nome de arquivo seguro: "relatorio-uso-laboratorio-02-2026-11-20". */
export function usagePdfFileName(...parts: string[]) {
  const slug = parts
    .join("-")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `relatorio-uso-${slug}`;
}
