import { hhmm, sortSchedules } from "#/lib/queries/schedules";
import { modalityLabel, type UsageSession } from "#/lib/queries/usage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const count = (value: number | string | null | undefined) =>
  value === null || value === undefined ? "—" : String(value);

/** Relatório de uso só leitura: uma linha por horário do turno (turma, modalidade, notebooks e fontes). */
export function UsageReportView({ session }: { session: UsageSession }) {
  const entries = new Map(session.entries.map((entry) => [Number(entry.scheduleId), entry]));
  const schedules = sortSchedules(session.schedules);

  if (session.entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum horário preenchido.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2}>Horário</TableHead>
            <TableHead rowSpan={2}>Turma</TableHead>
            <TableHead rowSpan={2}>Modalidade</TableHead>
            <TableHead colSpan={2} className="text-center">
              Entrada
            </TableHead>
            <TableHead colSpan={2} className="text-center">
              Saída
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="text-center">Notebooks</TableHead>
            <TableHead className="text-center">Fontes</TableHead>
            <TableHead className="text-center">Notebooks</TableHead>
            <TableHead className="text-center">Fontes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => {
            const entry = entries.get(Number(schedule.id));
            const mismatch =
              entry &&
              entry.notebooksOut !== null &&
              (Number(entry.notebooksOut) !== Number(entry.notebooksIn) ||
                Number(entry.chargersOut) !== Number(entry.chargersIn));

            return (
              <TableRow key={schedule.id}>
                <TableCell className="whitespace-nowrap font-medium">
                  {hhmm(schedule.startAt)} às {hhmm(schedule.endAt)}
                </TableCell>
                {entry ? (
                  <>
                    <TableCell>{entry.className}</TableCell>
                    <TableCell>{modalityLabel(entry.modality)}</TableCell>
                    <TableCell className="text-center tabular-nums">{count(entry.notebooksIn)}</TableCell>
                    <TableCell className="text-center tabular-nums">{count(entry.chargersIn)}</TableCell>
                    <TableCell
                      className={`text-center tabular-nums ${mismatch ? "font-bold text-rose-600 dark:text-rose-400" : ""}`}
                    >
                      {count(entry.notebooksOut)}
                    </TableCell>
                    <TableCell
                      className={`text-center tabular-nums ${mismatch ? "font-bold text-rose-600 dark:text-rose-400" : ""}`}
                    >
                      {count(entry.chargersOut)}
                    </TableCell>
                  </>
                ) : (
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Não preenchido
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
