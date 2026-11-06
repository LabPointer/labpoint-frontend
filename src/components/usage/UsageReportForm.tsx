import { useForm, useStore } from "@tanstack/react-form";
import { useId, useMemo } from "react";
import z from "zod";
import { hhmm, sortSchedules } from "#/lib/queries/schedules";
import { MODALITY_OPTIONS, USAGE_STATUS, type UsageEntriesBody, type UsageSession } from "#/lib/queries/usage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

/**
 * - `check-in`: entrada (ao menos o 1º horário), sem saída.
 * - `entries`: preencher horário a horário enquanto em uso; saída opcional.
 * - `check-out` / `admin-check-out`: todos os horários com entrada e saída.
 * - `admin-edit`: corrige o relatório (sessão encerrada continua exigindo a saída).
 */
export type UsageFormMode = "check-in" | "entries" | "check-out" | "admin-edit" | "admin-check-out";

type UsageReportFormProps = {
  session: UsageSession;
  mode: UsageFormMode;
  submitLabel: string;
  onSubmit: (body: UsageEntriesBody) => Promise<unknown>;
  onCancel?: () => void;
  disabled?: boolean;
  /** Motivo exibido acima do botão quando `disabled` (ex.: "O check-out abre às 11:30"). */
  disabledReason?: string;
};

type Row = {
  scheduleId: number;
  label: string;
  className: string;
  modality: number;
  notebooksIn: string;
  chargersIn: string;
  notebooksOut: string;
  chargersOut: string;
};

const MAX_COUNT = 999;

type CountField = "notebooksIn" | "chargersIn" | "notebooksOut" | "chargersOut";
const COUNT_LABELS: Record<CountField, string> = {
  notebooksIn: "Notebooks",
  chargersIn: "Fontes",
  notebooksOut: "Notebooks",
  chargersOut: "Fontes",
};
const isCount = (value: string) => /^\d+$/.test(value.trim()) && Number(value) <= MAX_COUNT;
const toText = (value: number | string | null | undefined) =>
  value === null || value === undefined ? "" : String(value);

function buildSchema(mode: UsageFormMode, requireExit: boolean) {
  const showExit = mode !== "check-in";

  return z
    .object({
      repeat: z.boolean(),
      rows: z.array(
        z.object({
          scheduleId: z.number(),
          label: z.string(),
          className: z.string(),
          modality: z.number(),
          notebooksIn: z.string(),
          chargersIn: z.string(),
          notebooksOut: z.string(),
          chargersOut: z.string(),
        }),
      ),
    })
    .superRefine((value, ctx) => {
      value.rows.forEach((row, index) => {
        if (value.repeat && index > 0) return;

        const filled = [row.className, row.notebooksIn, row.chargersIn, row.notebooksOut, row.chargersOut].some(
          (field) => field.trim() !== "",
        );
        const required = value.repeat || requireExit || (mode === "check-in" && index === 0) || filled;
        if (!required) return;

        const issue = (field: keyof Row, message: string) =>
          ctx.addIssue({ code: "custom", path: ["rows", index, field], message });

        const name = row.className.trim();
        if (!name) issue("className", "Informe a turma.");
        else if (name.length > 60) issue("className", "Máximo de 60 caracteres.");
        if (!isCount(row.notebooksIn)) issue("notebooksIn", `De 0 a ${MAX_COUNT}.`);
        if (!isCount(row.chargersIn)) issue("chargersIn", `De 0 a ${MAX_COUNT}.`);

        if (!showExit) return;
        const exitFilled = row.notebooksOut.trim() !== "" || row.chargersOut.trim() !== "";
        if (requireExit || exitFilled) {
          if (!isCount(row.notebooksOut)) issue("notebooksOut", `De 0 a ${MAX_COUNT}.`);
          if (!isCount(row.chargersOut)) issue("chargersOut", `De 0 a ${MAX_COUNT}.`);
        }
      });
    });
}

/**
 * Formulário do "Controle de uso diário": uma linha por horário do turno com turma, modalidade e notebooks/fontes
 * na entrada e na saída. "Repetir para todos os horários" envia só a 1ª linha e o backend a copia para os demais.
 */
export function UsageReportForm({
  session,
  mode,
  submitLabel,
  onSubmit,
  onCancel,
  disabled = false,
  disabledReason,
}: UsageReportFormProps) {
  const formId = useId();
  const showExit = mode !== "check-in";
  const requireExit =
    mode === "check-out" ||
    mode === "admin-check-out" ||
    (mode === "admin-edit" && Number(session.status) === USAGE_STATUS.COMPLETED);

  const schema = useMemo(() => buildSchema(mode, requireExit), [mode, requireExit]);

  const defaultRows = useMemo<Row[]>(() => {
    const entries = new Map(session.entries.map((entry) => [Number(entry.scheduleId), entry]));
    return sortSchedules(session.schedules).map((schedule) => {
      const entry = entries.get(Number(schedule.id));
      return {
        scheduleId: Number(schedule.id),
        label: `${hhmm(schedule.startAt)} às ${hhmm(schedule.endAt)}`,
        className: entry?.className ?? "",
        modality: entry ? Number(entry.modality) : 0,
        notebooksIn: toText(entry?.notebooksIn),
        chargersIn: toText(entry?.chargersIn),
        notebooksOut: toText(entry?.notebooksOut),
        chargersOut: toText(entry?.chargersOut),
      };
    });
  }, [session.entries, session.schedules]);

  const form = useForm({
    defaultValues: {
      // Primeiro preenchimento de um turno com vários horários: repetir é o caso comum.
      repeat: session.entries.length === 0 && defaultRows.length > 1,
      rows: defaultRows,
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const rows = value.repeat
        ? value.rows.slice(0, 1)
        : value.rows.filter((row) =>
            [row.className, row.notebooksIn, row.chargersIn, row.notebooksOut, row.chargersOut].some(
              (field) => field.trim() !== "",
            ),
          );

      await onSubmit({
        repeatForAll: value.repeat,
        entries: rows.map((row) => ({
          scheduleId: row.scheduleId,
          className: row.className.trim(),
          modality: row.modality,
          notebooksIn: Number(row.notebooksIn),
          chargersIn: Number(row.chargersIn),
          notebooksOut: showExit && row.notebooksOut.trim() !== "" ? Number(row.notebooksOut) : null,
          chargersOut: showExit && row.chargersOut.trim() !== "" ? Number(row.chargersOut) : null,
        })),
      });
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const repeat = useStore(form.store, (state) => state.values.repeat);
  const rowCount = defaultRows.length;

  /** Par "Quantidade de notebooks / fontes" de uma etapa (entrada ou saída). */
  const countPair = (title: string, index: number, fields: [CountField, CountField]) => (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((name) => (
          <form.Field key={name} name={`rows[${index}].${name}`}>
            {(field) => (
              <Field>
                <FieldLabel htmlFor={`${formId}-${index}-${name}`}>{COUNT_LABELS[name]}</FieldLabel>
                <Input
                  id={`${formId}-${index}-${name}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_COUNT}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        ))}
      </div>
    </div>
  );

  return (
    <form
      id={formId}
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      {rowCount > 1 && (
        <form.Field name="repeat">
          {(field) => (
            <Field orientation="horizontal">
              <Checkbox
                id={`${formId}-repeat`}
                checked={field.state.value}
                disabled={disabled}
                onCheckedChange={(value) => field.handleChange(value === true)}
              />
              <FieldLabel htmlFor={`${formId}-repeat`}>
                Repetir as mesmas informações para todos os {rowCount} horários
              </FieldLabel>
            </Field>
          )}
        </form.Field>
      )}

      {defaultRows.map((row, index) => {
        if (repeat && index > 0) return null;
        const title = repeat ? `Todos os horários (${defaultRows.map((r) => r.label).join(" · ")})` : row.label;

        return (
          <fieldset key={row.scheduleId} className="flex flex-col gap-3 rounded-md border p-3" disabled={disabled}>
            <legend className="px-1 text-sm font-semibold">{title}</legend>

            <div className="grid gap-3 sm:grid-cols-2">
              <form.Field name={`rows[${index}].className`}>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={`${formId}-${index}-class`}>Turma</FieldLabel>
                    <Input
                      id={`${formId}-${index}-class`}
                      value={field.state.value}
                      maxLength={60}
                      placeholder="Ex.: TDS-2026-A"
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field name={`rows[${index}].modality`}>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={`${formId}-${index}-modality`}>Modalidade</FieldLabel>
                    <NativeSelect
                      id={`${formId}-${index}-modality`}
                      className="w-full"
                      value={String(field.state.value)}
                      onChange={(event) => field.handleChange(Number(event.target.value))}
                    >
                      {MODALITY_OPTIONS.map((option) => (
                        <NativeSelectOption key={option.value} value={option.value}>
                          {option.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                )}
              </form.Field>
            </div>

            {countPair("Entrada", index, ["notebooksIn", "chargersIn"])}
            {showExit &&
              countPair(requireExit ? "Saída" : "Saída (preencha ao devolver)", index, ["notebooksOut", "chargersOut"])}
          </fieldset>
        );
      })}

      {disabled && disabledReason && <p className="text-sm text-muted-foreground">{disabledReason}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" form={formId} disabled={disabled || isSubmitting}>
          {isSubmitting ? "Enviando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
