import { CrownIcon, MoonIcon } from "lucide-react";
import { formatPercent, initials, pluralize, type ReportData, type ReportUserStat } from "#/lib/utils/report";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ReportMode, ReportSkeleton, reportCardClass } from "./report-ui";

type ReportUserCardsProps = { report: ReportData; mode: ReportMode };

export function ReportUserCards({ report, mode }: ReportUserCardsProps) {
  const { users } = report;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <UserCard
        mode={mode}
        title="Usuário com mais reservas"
        icon={<CrownIcon className="size-4 text-violet-500 dark:text-violet-400" />}
        user={users.mostReserves}
        avatarClass="bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300"
        emptyText="Nenhuma reserva no mês"
        stat={(user) => ({
          value: String(user.totalReserves),
          label: user.totalReserves === 1 ? "reserva" : "reservas",
          detail: user.absentReserves > 0 ? pluralize(user.absentReserves, "ausência", "ausências") : "sem ausências",
        })}
      />
      <UserCard
        mode={mode}
        title="Usuário mais ocioso"
        icon={<MoonIcon className="size-4 text-rose-500 dark:text-rose-400" />}
        user={users.mostIdle}
        avatarClass="bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300"
        valueClass="text-destructive"
        emptyText="Nenhuma ausência registrada no mês"
        stat={(user) => ({
          value: String(user.absentReserves),
          label: user.absentReserves === 1 ? "ausência" : "ausências",
          detail: `${formatPercent(user.idleRate)} de ${pluralize(user.totalReserves, "reserva", "reservas")}`,
        })}
      />
    </div>
  );
}

type UserCardProps = {
  mode: ReportMode;
  title: string;
  icon: React.ReactNode;
  user: ReportUserStat | null;
  avatarClass: string;
  valueClass?: string;
  emptyText: string;
  stat: (user: ReportUserStat) => { value: string; label: string; detail: string };
};

function UserCard({ mode, title, icon, user, avatarClass, valueClass, emptyText, stat }: UserCardProps) {
  const numbers = user && stat(user);

  return (
    <Card className={cn(reportCardClass(mode), "gap-3")}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <p>{title}</p>
      </div>

      {mode !== "data" ? (
        <div className="flex items-center gap-3" aria-hidden="true">
          <ReportSkeleton mode={mode} className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <ReportSkeleton mode={mode} className="h-4 w-40" />
            <ReportSkeleton mode={mode} className="h-3 w-24" />
          </div>
          <ReportSkeleton mode={mode} className="h-8 w-12" />
        </div>
      ) : user && numbers ? (
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback className={cn("font-semibold", avatarClass)}>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground" title={user.name}>
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground">Matrícula {user.registration}</p>
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold leading-none text-foreground", valueClass)}>{numbers.value}</p>
            <p className="text-xs text-muted-foreground">{numbers.label}</p>
            <p className="text-xs text-muted-foreground">{numbers.detail}</p>
          </div>
        </div>
      ) : (
        <p className="py-2 text-sm font-medium text-muted-foreground">{emptyText}</p>
      )}
    </Card>
  );
}
