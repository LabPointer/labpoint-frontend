import { subYears } from "date-fns";
import { useNow } from "#/hooks/use-now";
import { toApiDate } from "#/lib/queries/reserves";
import { USAGE_STATUS, type UsageSession, useAdminUsages, useMyUsages } from "#/lib/queries/usage";
import { checkInWindow, checkOutWindow } from "./usage-windows";

const REFRESH_MS = 60_000;

/** Sessão com check-in ou check-out liberado agora. */
function hasOpenStep(session: UsageSession, now: number) {
  const status = Number(session.status);
  if (status === USAGE_STATUS.SCHEDULED) return checkInWindow(session, now).open;
  if (status === USAGE_STATUS.CHECKED_IN) return checkOutWindow(session, now).open;
  return false;
}

/**
 * Indica se há algo a fazer nas páginas de check-out, para a bolinha de notificação da sidebar.
 * - `mine`: alguma sessão do usuário com a janela de check-in ou de check-out aberta agora.
 * - `admin`: alguma sessão com check-out pendente esperando a coordenação (só consultado para admins).
 */
export function useCheckOutAlerts({ isAdmin }: { isAdmin: boolean }) {
  const now = useNow();

  const mine = useMyUsages(
    { statuses: [USAGE_STATUS.SCHEDULED, USAGE_STATUS.CHECKED_IN], limit: 100 },
    { refetchInterval: REFRESH_MS },
  );

  // Pendentes podem ser de dias anteriores; o backend exige um período, então olha o último ano.
  const today = new Date(now);
  const pending = useAdminUsages(
    {
      startAt: toApiDate(subYears(today, 1)),
      endAt: toApiDate(today),
      statuses: [USAGE_STATUS.CHECKOUT_PENDING],
      limit: 1,
    },
    { enabled: isAdmin, refetchInterval: REFRESH_MS },
  );

  return {
    mine: (mine.data ?? []).some((session) => hasOpenStep(session, now)),
    admin: isAdmin && (pending.data?.length ?? 0) > 0,
  };
}
