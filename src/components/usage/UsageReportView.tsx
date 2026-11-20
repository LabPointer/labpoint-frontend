import { hhmm, sortSchedules } from "#/lib/queries/schedules";
import { modalityLabel, type UsageSession } from "#/lib/queries/usage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const count = (value: number | string | null | undefined) =>
  value === null || value === undefined ? "—" : String(value);

/**
 * Relatório de uso só leitura: uma linha por horário do turno (turma, modalidade, notebooks e fontes).
 * Mede a largura do próprio contêiner (não da tela): em espaços estreitos, como celulares, cards e dialogs,
 * vira uma lista de cartões, evitando a rolagem horizontal da tabela de 7 colunas.
 */
export function UsageReportView({ session }: { session: UsageSession }) {
  const entries = new Map(session.entries.map((entry) => [Number(entry.scheduleId), entry]));
  const schedules = sortSchedules(session.schedules);

  if (session.entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum horário preenchido.</p>;
  }

  const rows = schedules.map((schedule) => {
    const entry = entries.get(Number(schedule.id));
    const mismatch = Boolean(
      entry &&
        entry.notebooksOut !== null &&
        (Number(entry.notebooksOut) !== Number(entry.notebooksIn) ||
          Number(entry.chargersOut) !== Number(entry.chargersIn)),
    );
    return { schedule, entry, mismatch, label: `${hhmm(schedule.startAt)} às ${hhmm(schedule.endAt)}` };
  });

  return (
    <div className="@container">
      <ul className="flex flex-col gap-2 @xl:hidden">
        {rows.map(({ schedule, entry, mismatch, label }) => (
          <li key={schedule.id} className="rounded-md border p-2.5 text-xs">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <span className="font-semibold">{label}</span>
              {entry && <span className="text-muted-foreground">{modalityLabel(entry.modality)}</span>}
            </div>
            {entry ? (
              <>
                <p className="mt-0.5 wrap-break-word">Turma: {entry.className}</p>
                <dl className="mt-2 grid grid-cols-2 gap-2">
                  <CountBlock title="Entrada" notebooks={entry.notebooksIn} chargers={entry.chargersIn} />
                  <CountBlock
                    title="Saída"
                    notebooks={entry.notebooksOut}
                    chargers={entry.chargersOut}
                    highlight={mismatch}
                  />
                </dl>
              </>
            ) : (
              <p className="mt-0.5 text-muted-foreground">Não preenchido</p>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-md border @xl:block">
        <UsageReportTable rows={rows} />
      </div>
    </div>
  );
}

function CountBlock({
  title,
  notebooks,
  chargers,
  highlight = false,
}: {
  title: string;
  notebooks: number | string | null | undefined;
  chargers: number | string | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="rounded bg-muted/50 px-2 py-1.5">
      <dt className="font-semibold uppercase tracking-wide text-muted-foreground">{title}</dt>
      <dd className={highlight ? "font-bold text-rose-600 tabular-nums dark:text-rose-400" : "tabular-nums"}>
        <span className="block">{count(notebooks)} notebooks</span>
        <span className="block">{count(chargers)} fontes</span>
      </dd>
    </div>
  );
}

type ReportRow = {
  schedule: UsageSession["schedules"][number];
  entry: UsageSession["entries"][number] | undefined;
  mismatch: boolean;
  label: string;
};

function UsageReportTable({ rows }: { rows: ReportRow[] }) {
  return (
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
        {rows.map(({ schedule, entry, mismatch, label }) => (
          <TableRow key={schedule.id}>
            <TableCell className="whitespace-nowrap font-medium">{label}</TableCell>
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
        ))}
      </TableBody>
    </Table>
  );
}
