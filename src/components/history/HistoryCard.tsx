import { Calendar, Clock, Pencil, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Schedules } from "@/lib/service";

export interface HistoryCardProps {
  id: string;
  spaceName: string;
  capacity: string;
  status: "CONFIRMED" | "PENDING" | "LOCKED" | "CANCELED";
  dateFrom: string;
  dateTo: string;
  schedules: (
    | "M_AULA_1"
    | "M_AULA_2"
    | "M_AULA_3"
    | "M_AULA_4"
    | "M_AULA_5"
    | "V_AULA_1"
    | "V_AULA_2"
    | "V_AULA_3"
    | "V_AULA_4"
    | "V_AULA_5"
    | "N_AULA_1"
    | "N_AULA_2"
    | "N_AULA_3"
    | "N_AULA_4"
  )[];
  purpose: string;
  showCTA: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
}

export function HistoryCard({
  id,
  spaceName,
  capacity,
  status,
  dateFrom,
  dateTo,
  schedules,
  purpose,
  showCTA = true,
  onEdit,
  onCancel,
}: HistoryCardProps) {
  const dataFromObj = new Date(dateFrom + "T00:00:00");
  const dataToObj = new Date(dateTo + "T00:00:00");

  const morning = schedules.filter((schedule) => schedule.startsWith("M_AULA"));
  const afternoon = schedules.filter((schedule) => schedule.startsWith("V_AULA"));
  const night = schedules.filter((schedule) => schedule.startsWith("N_AULA"));

  const morningSchedules = morning
    .map((schedule) => {
      const key = schedule;
      return key ? (Schedules.get(key) ?? key) : null;
    })
    .filter((schedule): schedule is string => schedule !== null);

  const afternoonSchedules = afternoon
    .map((schedule) => {
      const key = schedule;
      return key ? (Schedules.get(key) ?? key) : null;
    })
    .filter((schedule): schedule is string => schedule !== null);

  const nightSchedules = night
    .map((schedule) => {
      const key = schedule;
      return key ? (Schedules.get(key) ?? key) : null;
    })
    .filter((schedule): schedule is string => schedule !== null);

  return (
    <Card className="min-w-72 max-w-72 min-h-72 bg-white dark:bg-white/5 rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
      <CardHeader className="p-0 border-0 flex flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-bold text-foreground">{spaceName}</CardTitle>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Users className="size-3.5" />
            <span>{capacity} lugares</span>
          </div>
        </div>

        <CardAction className="m-0">
          <Badge
            variant="outline"
            className={`rounded-full border-emerald-300 bg-emerald-50 ${status === 'CONFIRMED' ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-400' : status === 'PENDING' ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-400' : status === 'LOCKED' ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800/70 dark:bg-violet-950/40 dark:text-violet-400' : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/40 dark:text-rose-400'} text-xs font-medium px-3 py-0.5`}
          >
            {status}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="p-0 h-full flex flex-col gap-2.5 text-sm">
        <div className="flex items-center gap-2 text-foreground/90">
          <Calendar className="size-4 text-violet-500 dark:text-violet-400 shrink-0" />
          <span className="font-semibold text-sm">
            {dateFrom === dateTo
              ? dataFromObj.toLocaleDateString()
              : `${dataFromObj.toLocaleDateString()} a ${dataToObj.toLocaleDateString()}`}
          </span>
        </div>
        <div className="min-h-54 flex flex-col items-start gap-2 text-foreground/90">
          {morningSchedules.length > 0 && (
            <div className="w-full flex flex-col items-start gap-1">
              <div className="w-full flex items-center gap-1">
                <Clock className="size-4 text-violet-500 dark:text-violet-400 shrink-0" />
                <span className="text-sm font-semibold">Manhã: </span>
              </div>
              <p className="w-full text-xs font-medium rounded-md border p-1">
                {morningSchedules.map((schedule) => schedule.slice(8)).join(" - ")}
              </p>
            </div>
          )}
          {afternoonSchedules.length > 0 && (
            <div className="w-full flex flex-col items-start gap-1">
              <div className="w-full flex items-center gap-1">
                <Clock className="size-4 text-violet-500 dark:text-violet-400 shrink-0" />
                <span className="text-sm font-semibold">Tarde: </span>
              </div>
              <p className="w-full text-xs font-medium rounded-md border p-1">
                {afternoonSchedules.map((schedule) => schedule.slice(8)).join(" - ")}
              </p>
            </div>
          )}
          {nightSchedules.length > 0 && (
            <div className="w-full flex flex-col items-start gap-1">
              <div className="w-full flex items-center gap-1">
                <Clock className="size-4 text-violet-500 dark:text-violet-400 shrink-0" />
                <span className="text-sm font-semibold">Noite: </span>
              </div>
              <p className="w-full text-xs font-medium rounded-md border p-1">
                {nightSchedules.map((schedule) => schedule.slice(8)).join(" - ")}
              </p>
            </div>
          )}
        </div>
        <div className="text-sm">
          <p className="font-medium text-xs text-foreground">
            <span className="font-semibold text-sm">Propósito:</span> {purpose}
          </p>
        </div>
      </CardContent>

      {showCTA && (
        <CardFooter className="bg-transparent border-0 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 rounded-xl text-sm font-medium border-neutral-200 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={onEdit}
          >
            <Pencil className="size-4" />
            Alterar
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 rounded-xl text-sm font-medium border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
            onClick={() => {
              if (onCancel) {
                onCancel();
              }
            }}
          >
            <X className="size-4" />
            Cancelar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
