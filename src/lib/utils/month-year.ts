import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type MonthYear = {
	month: number;
	year: number;
};

export type MonthYearRange = {
	from?: MonthYear;
	to?: MonthYear;
};

/** Período já completo: de um mês ao outro, ambos inclusos (`from` e `to` iguais = um mês só). */
export type MonthYearPeriod = {
	from: MonthYear;
	to: MonthYear;
};

export const MONTH_LABELS = Array.from({ length: 12 }, (_, month) =>
	capitalize(format(new Date(2000, month, 1), "MMMM", { locale: ptBR })),
);

export function currentMonthYear(): MonthYear {
	const now = new Date();
	return { month: now.getMonth(), year: now.getFullYear() };
}

/** Último mês encerrado (o mês anterior ao atual, virando o ano em janeiro). */
export function previousMonthYear(): MonthYear {
	const { month, year } = currentMonthYear();
	return month === 0 ? { month: 11, year: year - 1 } : { month: month - 1, year };
}

export function compareMonthYear(a: MonthYear, b: MonthYear): number {
	return a.year * 12 + a.month - (b.year * 12 + b.month);
}

export function isSameMonthYear(a?: MonthYear, b?: MonthYear): boolean {
	return Boolean(a && b && a.month === b.month && a.year === b.year);
}

export function formatMonthYear(value?: MonthYear, placeholder = "Mês e ano") {
	if (!value) return placeholder;
	return `${MONTH_LABELS[value.month]} de ${value.year}`;
}

/** Período de um mês só. */
export function singleMonthPeriod(value: MonthYear): MonthYearPeriod {
	return { from: value, to: value };
}

export function isSinglePeriod({ from, to }: MonthYearPeriod): boolean {
	return isSameMonthYear(from, to);
}

/**
 * "Setembro de 2026" (um mês) · "Julho – Setembro de 2026" (mesmo ano) ·
 * "Novembro de 2025 – Fevereiro de 2026" (anos diferentes).
 */
export function formatMonthYearPeriod({ from, to }: MonthYearPeriod): string {
	if (isSameMonthYear(from, to)) return formatMonthYear(from);
	if (from.year === to.year) return `${MONTH_LABELS[from.month]} – ${formatMonthYear(to)}`;
	return `${formatMonthYear(from)} – ${formatMonthYear(to)}`;
}

export function normalizeRange(range: MonthYearRange): MonthYearRange {
	if (range.from && range.to && compareMonthYear(range.from, range.to) > 0) {
		return { from: range.to, to: range.from };
	}
	return range;
}

function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
