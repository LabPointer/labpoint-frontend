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

export const MONTH_LABELS = Array.from({ length: 12 }, (_, month) =>
	capitalize(format(new Date(2000, month, 1), "MMMM", { locale: ptBR })),
);

export function currentMonthYear(): MonthYear {
	const now = new Date();
	return { month: now.getMonth(), year: now.getFullYear() };
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

export function normalizeRange(range: MonthYearRange): MonthYearRange {
	if (range.from && range.to && compareMonthYear(range.from, range.to) > 0) {
		return { from: range.to, to: range.from };
	}
	return range;
}

function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
