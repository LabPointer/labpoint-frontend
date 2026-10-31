import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "#/lib/utils/api-result";
import type { MonthYearPeriod } from "#/lib/utils/month-year";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { toReportData } from "#/lib/utils/report";
import { api } from "#/lib/utils/restapi";

export const reportKeys = {
  all: ["report"] as const,
  period: ({ from, to }: MonthYearPeriod) => [...reportKeys.all, from.year, from.month, to.year, to.month] as const,
};

/** `month` do front vai de 0 a 11; o backend espera 1 a 12. */
async function fetchReport({ from, to }: MonthYearPeriod, refresh: boolean, signal?: AbortSignal) {
  return unwrap(
    await api.GET("/report", {
      params: {
        query: {
          FromYear: from.year,
          FromMonth: from.month + 1,
          ToYear: to.year,
          ToMonth: to.month + 1,
          Refresh: refresh || undefined,
        },
      },
      signal,
    }),
    "Erro ao gerar o relatório.",
  );
}

/**
 * Relatório de um mês ou de uma sequência de meses já encerrados. O backend grava o resultado na primeira
 * consulta do período, então depois disso a resposta é imediata; aqui só evitamos pedir de novo a cada troca.
 */
export function useReport(period: MonthYearPeriod) {
  return useQuery({
    queryKey: reportKeys.period(period),
    queryFn: ({ signal }) => fetchReport(period, false, signal),
    select: toReportData,
    staleTime: 5 * 60 * 1000,
  });
}

/** Ignora o relatório gravado e recalcula o período (útil quando reservas antigas foram editadas depois). */
export function useRefreshReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (period: MonthYearPeriod) => fetchReport(period, true),
    onSuccess: (data, period) => {
      queryClient.setQueryData(reportKeys.period(period), data);
      notifySuccess("Relatório atualizado com os dados mais recentes!");
    },
    onError: notifyError,
  });
}
