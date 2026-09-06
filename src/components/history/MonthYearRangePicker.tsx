import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import { Field, FieldLabel } from "#/components/ui/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils";
import { MonthYearGrid } from "./MonthYearGrid";
import {
	currentMonthYear,
	formatMonthYear,
	type MonthYear,
	type MonthYearRange,
	normalizeRange,
} from "./month-year";

type MonthYearRangePickerProps = {
	value?: MonthYearRange;
	defaultValue?: MonthYearRange;
	onChange?: (value: MonthYearRange) => void;
	minYear?: number;
	maxYear?: number;
	disabled?: boolean;
	className?: string;
	fromPlaceholder?: string;
	toPlaceholder?: string;
};

export function MonthYearRangePicker({
	value,
	defaultValue,
	onChange,
	minYear,
	maxYear,
	disabled,
	className,
	fromPlaceholder = "Mês inicial",
	toPlaceholder = "Mês final",
}: MonthYearRangePickerProps) {
	const today = currentMonthYear();
	const resolvedMinYear = minYear ?? today.year - 10;
	const resolvedMaxYear = maxYear ?? today.year + 2;
	const years = useMemo(
		() =>
			Array.from(
				{ length: resolvedMaxYear - resolvedMinYear + 1 },
				(_, index) => resolvedMinYear + index,
			),
		[resolvedMinYear, resolvedMaxYear],
	);

	const [uncontrolled, setUncontrolled] = useState<MonthYearRange>(
		defaultValue ?? {},
	);
	const selected = value ?? uncontrolled;
	const [open, setOpen] = useState(false);
	const [viewYear, setViewYear] = useState(
		selected.from?.year ?? selected.to?.year ?? today.year,
	);
	const [hoverMonth, setHoverMonth] = useState<MonthYear | undefined>();

	function commit(next: MonthYearRange) {
		const normalized = normalizeRange(next);
		if (value === undefined) setUncontrolled(normalized);
		onChange?.(normalized);
	}

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (nextOpen) {
			setViewYear(selected.from?.year ?? selected.to?.year ?? today.year);
			setHoverMonth(undefined);
		}
	}

	function handleSelectMonth(month: number) {
		const nextValue = { month, year: viewYear };

		if (!selected.from || (selected.from && selected.to)) {
			commit({ from: nextValue, to: undefined });
			return;
		}

		commit({ from: selected.from, to: nextValue });
		setOpen(false);
	}

	const label =
		selected.from && selected.to
			? `${formatMonthYear(selected.from)} – ${formatMonthYear(selected.to)}`
			: selected.from
				? `${formatMonthYear(selected.from)} – ${toPlaceholder}`
				: fromPlaceholder;

	return (
		<Field className={cn("w-fit", className)}>
			<FieldLabel className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
				Período
			</FieldLabel>
			<Popover open={open} onOpenChange={handleOpenChange}>
				<PopoverTrigger
					disabled={disabled}
					render={
						<Button
							variant="outline"
							className="h-10 min-w-72 justify-between bg-white/10 border dark:border-violet-400/20 shadow-md hover:shadow-lg dark:shadow-violet-300/20"
						/>
					}
				>
					<span className="flex items-center gap-2">
						<CalendarIcon className="size-4 text-violet-500 dark:text-violet-400" />
						<span
							className={cn(
								(!selected.from || !selected.to) && "text-muted-foreground",
							)}
						>
							{label}
						</span>
					</span>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-72 p-3">
					<p className="px-1 text-xs text-muted-foreground">
						{selected.from && !selected.to
							? "Selecione o mês final"
							: "Selecione o mês inicial e o mês final"}
					</p>
					<MonthYearGrid
						viewYear={viewYear}
						years={years}
						selected={undefined}
						rangeStart={selected.from}
						rangeEnd={selected.to}
						hoverMonth={hoverMonth}
						onViewYearChange={setViewYear}
						onSelectMonth={handleSelectMonth}
						onHoverMonth={setHoverMonth}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
}
