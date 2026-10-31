import { CrownIcon, MoonIcon } from "lucide-react";
import { formatPercent, initials, pluralize, type ReportData, type ReportUserStat } from "#/lib/utils/report";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CollapsibleList, type ReportMode, ReportSkeleton, reportCardClass } from "./report-ui";

type ReportUserCardsProps = { report: ReportData; mode: ReportMode };

export function ReportUserCards({ report, mode }: ReportUserCardsProps) {
  const { users } = report;

  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <UserCard
        mode={mode}
        title={(count) => (count > 1 ? "Usuários com mais reservas" : "Usuário com mais reservas")}
        icon={<CrownIcon className="size-4 text-violet-500 dark:text-violet-400" />}
        users={users.mostReserves}
        avatarClass="bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300"
        emptyText="Nenhuma reserva no período"
        stat={(user) => ({
          value: String(user.totalReserves),
          label: user.totalReserves === 1 ? "reserva" : "reservas",
          detail: user.absentReserves > 0 ? pluralize(user.absentReserves, "ausência", "ausências") : "sem ausências",
        })}
      />
      <UserCard
        mode={mode}
        title={(count) => (count > 1 ? "Usuários mais ociosos" : "Usuário mais ocioso")}
        icon={<MoonIcon className="size-4 text-rose-500 dark:text-rose-400" />}
        users={users.mostIdle}
        avatarClass="bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300"
        valueClass="text-destructive"
        emptyText="Nenhuma ausência registrada no período"
        stat={(user) => ({
          value: String(user.absentReserves),
          label: user.absentReserves === 1 ? "ausência" : "ausências",
          detail: `${formatPercent(user.idleRate)} de ${pluralize(user.totalReserves, "reserva", "reservas")}`,
        })}
      />
    </div>
  );
}

/** Quantos usuários empatados aparecem antes do botão "Ver mais". */
const VISIBLE_TIES = 3;

type UserCardProps = {
  mode: ReportMode;
  /** Recebe quantos usuários empataram, para o título ir ao plural. */
  title: (count: number) => string;
  icon: React.ReactNode;
  /** Todos os usuários empatados nesse ranking (vazio = ninguém se enquadra). */
  users: ReportUserStat[];
  avatarClass: string;
  valueClass?: string;
  emptyText: string;
  stat: (user: ReportUserStat) => { value: string; label: string; detail: string };
};

function UserCard({ mode, title, icon, users, avatarClass, valueClass, emptyText, stat }: UserCardProps) {
  return (
    <Card className={cn(reportCardClass(mode), "gap-3")}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <p>{title(users.length)}</p>
        {users.length > 1 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
            {users.length} empatados
          </span>
        )}
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
      ) : users.length === 0 ? (
        <p className="py-2 text-sm font-medium text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-3">
          <CollapsibleList
            items={users}
            limit={VISIBLE_TIES}
            noun={users.length - VISIBLE_TIES === 1 ? "usuário empatado" : "usuários empatados"}
            renderItem={(user, index) => (
              <UserRow
                key={user.accountId}
                user={user}
                numbers={stat(user)}
                avatarClass={avatarClass}
                valueClass={valueClass}
                separated={index > 0}
              />
            )}
          />
        </div>
      )}
    </Card>
  );
}

type UserRowProps = {
  user: ReportUserStat;
  numbers: { value: string; label: string; detail: string };
  avatarClass: string;
  valueClass?: string;
  /** Linha divisória em cima, para separar os usuários empatados. */
  separated: boolean;
};

function UserRow({ user, numbers, avatarClass, valueClass, separated }: UserRowProps) {
  return (
    <div className={cn("flex items-center gap-3", separated && "border-t pt-3")}>
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
  );
}
