import { fetchReserveUsage, type ReserveKind, type UsageSession } from "#/lib/queries/usage";
import { ApiError } from "#/lib/types/error-types";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { exportUsagePdf, type UsagePdfGroup, usagePdfFileName } from "#/lib/utils/usage-pdf";
import { sessionTitle } from "./usage-format";

const today = () => new Date().toISOString().slice(0, 10);

/** Uma reserva selecionada: o título e o subtítulo do grupo no PDF. */
export type SelectedReserve = { id: number; title: string; subtitle: string };

/** Busca o relatório de uso de cada reserva selecionada e gera um PDF só, com uma seção por reserva. */
export async function exportReservesUsagePdf(kind: ReserveKind, reserves: SelectedReserve[]) {
  try {
    const groups: UsagePdfGroup[] = await Promise.all(
      reserves.map(async (reserve) => ({
        title: reserve.title,
        subtitle: reserve.subtitle,
        sessions: await fetchReserveUsage(kind, reserve.id),
      })),
    );
    const label = `${reserves.length} ${reserves.length === 1 ? "reserva selecionada" : "reservas selecionadas"}`;
    exportUsagePdf(
      groups,
      label,
      usagePdfFileName(kind === "space" ? "reservas-de-espaco" : "reservas-de-recurso", today()),
    );
    notifySuccess("PDF gerado.");
  } catch (error) {
    notifyError(error instanceof ApiError ? error : undefined);
  }
}

/** PDF das sessões selecionadas no Gerenciar check-out (já carregadas na tabela), uma seção por sessão. */
export function exportSessionsUsagePdf(sessions: UsageSession[]) {
  const groups = sessions.map((session) => ({
    title: sessionTitle(session),
    subtitle: `${session.account.userName ?? "Sem nome"} (${session.account.registration})`,
    sessions: [session],
  }));
  const label = `${sessions.length} ${sessions.length === 1 ? "sessão selecionada" : "sessões selecionadas"}`;
  exportUsagePdf(groups, label, usagePdfFileName("sessoes-de-uso", today()));
}
