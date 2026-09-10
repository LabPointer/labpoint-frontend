import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isSameMonthYear, MONTH_LABELS, type MonthYear } from "../../lib/utils/month-year";

type MonthYearGridProps = {
	viewYear: number;
	years: number[];
	selected?: MonthYear;
	rangeStart?: MonthYear;
	rangeEnd?: MonthYear;
	hoverMonth?: MonthYear;
	onViewYearChange: (year: number) => void;
	onSelectMonth: (month: number) => void;
	onHoverMonth?: (value?: MonthYear) => void;
};

export function MonthYearGrid({
	viewYear,
	years,
	selected,
	rangeStart,
	rangeEnd,
	hoverMonth,
	onViewYearChange,
	onSelectMonth,
	onHoverMonth,
}: MonthYearGridProps) {
	const minYear = years[0];
	const maxYear = years[years.length - 1];
	const previewEnd =
		rangeStart && !rangeEnd && hoverMonth ? hoverMonth : rangeEnd;

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-1">
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					disabled={viewYear <= minYear}
					onClick={() => onViewYearChange(viewYear - 1)}
					aria-label="Ano anterior"
				>
					<ChevronLeftIcon />
				</Button>
				<Select
					value={String(viewYear)}
					onValueChange={(year) => {
						if (year) onViewYearChange(Number(year));
					}}
				>
					<SelectTrigger className="h-8 flex-1 justify-center">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{years.map((year) => (
							<SelectItem key={year} value={String(year)}>
								{year}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					disabled={viewYear >= maxYear}
					onClick={() => onViewYearChange(viewYear + 1)}
					aria-label="Próximo ano"
				>
					<ChevronRightIcon />
				</Button>
			</div>

			<div className="grid grid-cols-3 gap-1.5">
				{MONTH_LABELS.map((label, month) => {
					const candidate = { month, year: viewYear };
					const isSelected = isSameMonthYear(selected, candidate);
					const isRangeStart = isSameMonthYear(rangeStart, candidate);
					const isRangeEnd = isSameMonthYear(previewEnd, candidate);
					const inRange = isInPreviewRange(candidate, rangeStart, previewEnd);

					return (
						<Button
							key={label}
							type="button"
							variant={
								isSelected || isRangeStart || isRangeEnd ? "default" : "ghost"
							}
							size="sm"
							className={cn(
								"h-9 justify-center text-xs font-medium",
								inRange &&
									!isRangeStart &&
									!isRangeEnd &&
									"bg-muted text-foreground",
							)}
							onClick={() => onSelectMonth(month)}
							onMouseEnter={() => onHoverMonth?.(candidate)}
							onMouseLeave={() => onHoverMonth?.(undefined)}
						>
							{label.slice(0, 3)}
						</Button>
					);
				})}
			</div>
		</div>
	);
}

function isInPreviewRange(
	candidate: MonthYear,
	from?: MonthYear,
	to?: MonthYear,
) {
	if (!from || !to) return false;
	const startValue = from.year * 12 + from.month;
	const endValue = to.year * 12 + to.month;
	const [start, end] =
		startValue <= endValue ? [startValue, endValue] : [endValue, startValue];
	const value = candidate.year * 12 + candidate.month;
	return value >= start && value <= end;
}
