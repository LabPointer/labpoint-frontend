import { format, parseISO } from "date-fns";
import type { components } from "#/lib/utils/api";
import { isSinglePeriod, type MonthYearPeriod } from "#/lib/utils/month-year";

type ApiReport = components["schemas"]["ReportResponseDTO"];
type ApiSpaceStat = components["schemas"]["ReportSpaceStatDTO"];
type ApiUserStat = components["schemas"]["ReportUserStatDTO"];

/** Valores de `EReportReserveStatus` no backend (DTOs/Report): Confirmed = 0, Absent = 1. */
export type ReportReserveStatus = "CONFIRMED" | "ABSENT";

export type ReportSpaceStat = {
  spaceId: number;
  name: string;
  /** 0 a 100 */
  occupancyRate: number;
  totalReserves: number;
  confirmedReserves: number;
  absentReserves: number;
  /** 0 a 100 */
  idleRate: number;
};

export type ReportUserStat = {
  accountId: string;
  name: string;
  registration: string;
  totalReserves: number;
  confirmedReserves: number;
  absentReserves: number;
  /** 0 a 100 */
  idleRate: number;
};

export type ReportReserveRow = {
  id: number;
  spaceName: string;
  userName: string;
  /** yyyy-MM-dd */
  dateFrom: string;
  /** yyyy-MM-dd */
  dateTo: string;
  status: ReportReserveStatus;
};

/**
 * Relatório pronto para a tela e para o PDF (números de verdade, mês de 0 a 11 como no resto do front).
 * `period` vai do primeiro ao último mês incluso (iguais quando é um mês só).
 *
 * Os rankings são listas porque pode haver empate: todos os espaços (ou usuários) com o mesmo valor aparecem,
 * em ordem alfabética. Lista vazia = ninguém se enquadra.
 *
 * Quando não há reservas contabilizadas no período, `isPreview` é true e todos os indicadores vêm vazios:
 * a tela e o PDF mostram o esqueleto de prévia em vez de zeros.
 */
export type ReportData = {
  period: MonthYearPeriod;
  generatedAt: string | null;
  isPreview: boolean;
  summary: {
    averageOccupancyRate: number | null;
    idleRate: number | null;
    totalReserves: number;
    confirmedReserves: number;
    absentReserves: number;
    mostDisputedSpaces: ReportSpaceStat[];
  };
  ranking: {
    highestDemand: ReportSpaceStat[];
    lowestDemand: ReportSpaceStat[];
    mostIdle: ReportSpaceStat[];
  };
  users: {
    mostReserves: ReportUserStat[];
    mostIdle: ReportUserStat[];
  };
  reserves: ReportReserveRow[];
};

/** Esqueleto: usado enquanto carrega e quando o período não tem nenhuma reserva contabilizada. */
export function emptyReportData(period: MonthYearPeriod): ReportData {
  return {
    period,
    generatedAt: null,
    isPreview: true,
    summary: {
      averageOccupancyRate: null,
      idleRate: null,
      totalReserves: 0,
      confirmedReserves: 0,
      absentReserves: 0,
      mostDisputedSpaces: [],
    },
    ranking: { highestDemand: [], lowestDemand: [], mostIdle: [] },
    users: { mostReserves: [], mostIdle: [] },
    reserves: [],
  };
}

const toSpaceStat = (stat: ApiSpaceStat): ReportSpaceStat => ({
  spaceId: Number(stat.spaceId),
  name: stat.name,
  occupancyRate: Number(stat.occupancyRate),
  totalReserves: Number(stat.totalReserves),
  confirmedReserves: Number(stat.confirmedReserves),
  absentReserves: Number(stat.absentReserves),
  idleRate: Number(stat.idleRate),
});

const toUserStat = (stat: ApiUserStat): ReportUserStat => ({
  accountId: stat.accountId,
  name: stat.name,
  registration: stat.registration,
  totalReserves: Number(stat.totalReserves),
  confirmedReserves: Number(stat.confirmedReserves),
  absentReserves: Number(stat.absentReserves),
  idleRate: Number(stat.idleRate),
});

export function toReportData(api: ApiReport): ReportData {
  const period: MonthYearPeriod = {
    from: { year: Number(api.fromYear), month: Number(api.fromMonth) - 1 },
    to: { year: Number(api.toYear), month: Number(api.toMonth) - 1 },
  };
  const reserves: ReportReserveRow[] = api.reserves.map((reserve) => ({
    id: Number(reserve.id),
    spaceName: reserve.spaceName,
    userName: reserve.userName,
    dateFrom: reserve.dateFrom,
    dateTo: reserve.dateTo,
    status: Number(reserve.status) === 0 ? "CONFIRMED" : "ABSENT",
  }));

  if (reserves.length === 0) return { ...emptyReportData(period), generatedAt: api.generatedAt };

  return {
    period,
    generatedAt: api.generatedAt,
    isPreview: false,
    summary: {
      averageOccupancyRate: Number(api.summary.averageOccupancyRate),
      idleRate: Number(api.summary.idleRate),
      totalReserves: Number(api.summary.totalReserves),
      confirmedReserves: Number(api.summary.confirmedReserves),
      absentReserves: Number(api.summary.absentReserves),
      mostDisputedSpaces: api.summary.mostDisputedSpaces.map(toSpaceStat),
    },
    ranking: {
      highestDemand: api.ranking.highestDemand.map(toSpaceStat),
      lowestDemand: api.ranking.lowestDemand.map(toSpaceStat),
      mostIdle: api.ranking.mostIdle.map(toSpaceStat),
    },
    users: {
      mostReserves: api.users.mostReserves.map(toUserStat),
      mostIdle: api.users.mostIdle.map(toUserStat),
    },
    reserves,
  };
}

const percentFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** 74.2 -> "74,2%" · 92 -> "92%" */
export const formatPercent = (value: number) => `${percentFormat.format(value)}%`;

export const formatReportDate = (date: string) => format(parseISO(date), "dd/MM/yyyy");

export const formatReportDateTime = (dateTime: string) => format(new Date(dateTime), "dd/MM/yyyy HH:mm");

export const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

/** "Maria da Silva" -> "MS" */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

/** Separa os primeiros `max` itens do resto (para listas de empate que podem ser longas). */
export function limitList<T>(items: readonly T[], max: number) {
  return { visible: items.slice(0, max), hidden: Math.max(0, items.length - max) };
}

/** relatorio-ocupacao-2026-09.pdf · relatorio-ocupacao-2026-07-a-2026-09.pdf */
export function reportFileName(period: MonthYearPeriod) {
  const label = ({ month, year }: MonthYearPeriod["from"]) => `${year}-${String(month + 1).padStart(2, "0")}`;
  const range = isSinglePeriod(period) ? label(period.from) : `${label(period.from)}-a-${label(period.to)}`;

  return `relatorio-ocupacao-${range}.pdf`;
}
