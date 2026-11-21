import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DataColumn } from "./columns";
import type { RowSelection } from "./use-row-selection";

type DataTableProps<T, C> = {
  rows: T[];
  /** Colunas já filtradas e ordenadas (`useColumnPreferences().visibleColumns`). */
  columns: DataColumn<T, C>[];
  context: C;
  getRowKey: (row: T) => string | number;
  caption: string;
  /** Botões da linha; sempre a última coluna. */
  actions?: (row: T) => ReactNode;
  /** Seleção de linhas (coluna de checkbox, com "selecionar todos da página" no cabeçalho). */
  selection?: RowSelection<T>;
  /** Nome da linha lido pelo leitor de tela no checkbox (ex.: "Laboratorio 02, 17/11/2026"). */
  rowLabel?: (row: T) => string;
};

const surfaceClass =
  "border bg-white shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15";

/**
 * Tabela padrão das telas da coordenação, com as colunas escolhidas pelo usuário.
 * Abaixo de `md` cada linha vira um cartão (rótulo: valor), então a tela nunca rola para os lados no celular;
 * as mesmas colunas escolhidas no seletor aparecem nos cartões, na mesma ordem.
 */
export function DataTable<T, C = undefined>({
  rows,
  columns,
  context,
  getRowKey,
  caption,
  actions,
  selection,
  rowLabel,
}: DataTableProps<T, C>) {
  const [titleColumn, ...detailColumns] = columns;
  const selectedOnPage = selection ? rows.filter((row) => selection.isSelected(row)).length : 0;
  const allOnPage = rows.length > 0 && selectedOnPage === rows.length;
  const label = (row: T) => `Selecionar ${rowLabel ? rowLabel(row) : "linha"}`;

  return (
    <>
      <ul aria-label={caption} className="flex flex-col gap-3 md:hidden">
        {selection && rows.length > 0 && (
          <li className="flex items-center gap-2 px-1 text-sm">
            <Checkbox
              id="select-page-mobile"
              checked={allOnPage}
              indeterminate={selectedOnPage > 0 && !allOnPage}
              onCheckedChange={(checked) => selection.togglePage(rows, checked === true)}
            />
            <label htmlFor="select-page-mobile">Selecionar todos da página</label>
          </li>
        )}
        {rows.map((row) => (
          <li key={getRowKey(row)} className={`flex flex-col gap-3 rounded-md p-3 ${surfaceClass}`}>
            {titleColumn && (
              <div className="flex min-w-0 items-start gap-2 font-bold wrap-break-word">
                {selection && (
                  <Checkbox
                    className="mt-1"
                    aria-label={label(row)}
                    checked={selection.isSelected(row)}
                    onCheckedChange={(checked) => selection.toggle(row, checked === true)}
                  />
                )}
                <div className="min-w-0">{titleColumn.cell(row, context)}</div>
              </div>
            )}
            {detailColumns.length > 0 && (
              <dl className="flex flex-col gap-2 text-sm">
                {detailColumns.map((column) => (
                  <div key={column.id} className="flex min-w-0 items-center justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">{column.label}</dt>
                    <dd className="min-w-0 text-right wrap-break-word">{column.cell(row, context)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actions && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">{actions(row)}</div>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Table className={`w-full p-4 ${surfaceClass}`}>
          <TableCaption>{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              {selection && (
                <TableHead className="w-10 text-center">
                  <Checkbox
                    className="mx-auto"
                    aria-label="Selecionar todos da página"
                    checked={allOnPage}
                    indeterminate={selectedOnPage > 0 && !allOnPage}
                    disabled={rows.length === 0}
                    onCheckedChange={(checked) => selection.togglePage(rows, checked === true)}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.id} className={column.headClassName}>
                  {column.label}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowKey(row)} data-state={selection?.isSelected(row) ? "selected" : undefined}>
                {selection && (
                  <TableCell className="w-10 text-center">
                    <Checkbox
                      className="mx-auto"
                      aria-label={label(row)}
                      checked={selection.isSelected(row)}
                      onCheckedChange={(checked) => selection.toggle(row, checked === true)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.cellClassName}>
                    {column.cell(row, context)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">{actions(row)}</div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
