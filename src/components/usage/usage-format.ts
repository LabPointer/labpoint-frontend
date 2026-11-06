import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { hhmm, shiftLabels, sortSchedules } from "#/lib/queries/schedules";
import type { UsageSession } from "#/lib/queries/usage";

export const fmtDate = (date: string) => format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });

/** Instante (ISO com fuso) em "HH:mm" no horário local do navegador. */
export const fmtTime = (instant: string) => format(new Date(instant), "HH:mm", { locale: ptBR });

/** Instante em "dd/MM HH:mm". */
export const fmtDateTime = (instant: string) => format(new Date(instant), "dd/MM HH:mm", { locale: ptBR });

/** Sala da reserva ou, em reserva de recurso avulsa, o nome do recurso. */
export const sessionPlace = (session: UsageSession) => session.spaceName ?? session.resources[0]?.name ?? "Reserva";

export const sessionShift = (session: UsageSession) => shiftLabels[Number(session.shift)] ?? "—";

/** "07:30 às 08:30 · 08:30 às 09:30" */
export const sessionSchedules = (session: UsageSession) =>
  sortSchedules(session.schedules)
    .map((schedule) => `${hhmm(schedule.startAt)} às ${hhmm(schedule.endAt)}`)
    .join(" · ");

/** "Sala 3 · 06/11/2026 · Manhã" */
export const sessionTitle = (session: UsageSession) =>
  `${sessionPlace(session)} · ${fmtDate(session.date)} · ${sessionShift(session)}`;
