import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import {
	currentMonthYear,
	formatMonthYear,
	type MonthYear,
} from "#/lib/month-year";
import { cn } from "#/lib/utils";
import { MonthYearGrid } from "./MonthYearGrid";

type MonthYearPickerProps = {
	value?: MonthYear;
	defaultValue?: MonthYear;
	onChange?: (value: MonthYear) => void;
	minYear?: number;
	maxYear?: number;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
};

export function MonthYearPicker({
	value,
	defaultValue,
	onChange,
	minYear,
	maxYear,
	placeholder = "Selecione o mês e o ano",
	disabled,
	className,
	id,
}: MonthYearPickerProps) {
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

	const [uncontrolled, setUncontrolled] = useState<MonthYear | undefined>(
		defaultValue,
	);
	const selected = value ?? uncontrolled;
	const [open, setOpen] = useState(false);
	const [viewYear, setViewYear] = useState(selected?.year ?? today.year);

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (nextOpen) {
			setViewYear(selected?.year ?? today.year);
		}
	}

	function handleSelect(month: number) {
		const next = { month, year: viewYear };
		if (value === undefined) setUncontrolled(next);
		onChange?.(next);
		setOpen(false);
	}

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger
				id={id}
				disabled={disabled}
				render={
					<Button
						variant="outline"
						className={cn(
							"h-10 min-w-52 justify-between bg-white/10 border dark:border-violet-400/20 shadow-md hover:shadow-lg dark:shadow-violet-300/20",
							className,
						)}
					/>
				}
			>
				<span className="flex items-center gap-2">
					<CalendarIcon className="size-4 text-violet-500 dark:text-violet-400" />
					<span className={cn(!selected && "text-muted-foreground")}>
						{formatMonthYear(selected, placeholder)}
					</span>
				</span>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-72 p-3">
				<MonthYearGrid
					viewYear={viewYear}
					years={years}
					selected={selected}
					onViewYearChange={setViewYear}
					onSelectMonth={handleSelect}
				/>
			</PopoverContent>
		</Popover>
	);
}
