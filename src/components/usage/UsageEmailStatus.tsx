import type { UsageSession } from "#/lib/queries/usage";
import { cn } from "@/lib/utils";
import { fmtDateTime } from "./usage-format";

type UsageEmail = NonNullable<UsageSession["checkInEmail"]>;

/** Valores de `EEmailStatus` no backend (Models/Types.cs). */
const EMAIL_STATUS = { PENDING: 0, SENT: 1, FAILED: 2, EXPIRED: 3 } as const;

const LABELS: Record<number, string> = {
  [EMAIL_STATUS.PENDING]: "Na fila",
  [EMAIL_STATUS.SENT]: "Enviado",
  [EMAIL_STATUS.FAILED]: "Falhou",
  [EMAIL_STATUS.EXPIRED]: "Expirado",
};

const CLASSES: Record<number, string> = {
  [EMAIL_STATUS.PENDING]: "text-amber-600 dark:text-amber-400",
  [EMAIL_STATUS.SENT]: "text-emerald-600 dark:text-emerald-400",
  [EMAIL_STATUS.FAILED]: "text-rose-600 dark:text-rose-400",
  [EMAIL_STATUS.EXPIRED]: "text-rose-600 dark:text-rose-400",
};

function describe(email: UsageEmail | null | undefined) {
  if (!email)
    return { label: "Não gerado", className: "text-muted-foreground", title: "O aviso ainda não foi gerado." };
  const status = Number(email.status);
  const attempts = Number(email.attempts);
  const title =
    status === EMAIL_STATUS.SENT && email.sentAt
      ? `Enviado em ${fmtDateTime(email.sentAt)}`
      : status === EMAIL_STATUS.EXPIRED
        ? "O prazo do aviso passou antes do envio; o link já não valeria."
        : status === EMAIL_STATUS.FAILED
          ? `Não foi enviado depois de ${attempts} tentativa(s).`
          : attempts > 0
            ? `Aguardando nova tentativa (${attempts} falha(s) até agora).`
            : "Aguardando envio.";
  return { label: LABELS[status] ?? "—", className: CLASSES[status] ?? "", title };
}

/** Situação dos avisos por e-mail de check-in e check-out de uma sessão (fila do serviço de e-mail). */
export function UsageEmailStatus({ session }: { session: UsageSession }) {
  const rows = [
    { step: "Check-in", ...describe(session.checkInEmail) },
    { step: "Check-out", ...describe(session.checkOutEmail) },
  ];

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      {rows.map((row) => (
        <span key={row.step} title={row.title} className="whitespace-nowrap">
          <span className="text-muted-foreground">{row.step}: </span>
          <span className={cn("font-medium", row.className)}>{row.label}</span>
        </span>
      ))}
    </div>
  );
}
