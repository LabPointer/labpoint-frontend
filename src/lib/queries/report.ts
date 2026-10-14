import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "#/lib/utils/api-result";
import type { MonthYear } from "#/lib/utils/month-year";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { toReportData } from "#/lib/utils/report";
import { api } from "#/lib/utils/restapi";

export const reportKeys = {
  all: ["report"] as const,
  month: ({ year, month }: MonthYear) => [...reportKeys.all, year, month] as const,
};

/** `month` do front vai de 0 a 11; o backend espera 1 a 12. */
async function fetchReport({ year, month }: MonthYear, refresh: boolean, signal?: AbortSignal) {
  return unwrap(
    await api.GET("/report", {
      params: { query: { Year: year, Month: month + 1, Refresh: refresh || undefined } },
      signal,
    }),
    "Erro ao gerar o relatório.",
  );
}

/**
 * Relatório de um mês já encerrado. O backend grava o resultado na primeira consulta do mês,
 * então depois disso a resposta é imediata; aqui só evitamos pedir de novo a cada troca de mês.
 */
export function useReport(period: MonthYear) {
  return useQuery({
    queryKey: reportKeys.month(period),
    queryFn: ({ signal }) => fetchReport(period, false, signal),
    select: toReportData,
    staleTime: 5 * 60 * 1000,
  });
}

/** Ignora o relatório gravado e recalcula o mês (útil quando reservas antigas foram editadas depois). */
export function useRefreshReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (period: MonthYear) => fetchReport(period, true),
    onSuccess: (data, period) => {
      queryClient.setQueryData(reportKeys.month(period), data);
      notifySuccess("Relatório atualizado com os dados mais recentes!");
    },
    onError: notifyError,
  });
}
