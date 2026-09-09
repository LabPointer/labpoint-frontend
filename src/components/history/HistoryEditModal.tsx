import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { CalendarIcon, PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApi } from "@/lib/restapi";
import { ApiExceptionError } from "#/lib/error";

type RequestData = {
  dateFrom: string;
  dateTo: string;
};

// ─── Props ───────────────────────────────────────────────────────────────────

export type HistoryEditModalProps = {
  /** ID da reserva a ser editada */
  id: number;
  /** Nome do espaço reservado (ex: "Sala 101") */
  name: string;
  /** Descrição/propósito da reserva (ex: "Workshop de Desenvolvimento Web") */
  description: string;
  /** Controla se o modal está aberto ou fechado */
  open: boolean;
  /** Callback chamado ao abrir ou fechar o modal */
  onOpenChange: (open: boolean) => void;
};

// ─── Validação ────────────────────────────────────────────────────────────────

const tomorrow = startOfDay(addDays(new Date(), 1));

const formSchema = z.object({
  dateFrom: z.date("Selecione a data de início."),
  dateTo: z.date("Selecione a data de término."),
});

// ─── Componente ───────────────────────────────────────────────────────────────

export function HistoryEditModal({ id, name, description, open, onOpenChange }: HistoryEditModalProps) {
  const api = useApi();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // ── Busca as datas atuais da reserva ao abrir o modal ──────────────────────
  const { data, isLoading: isLoadingDates } = useQuery({
    queryKey: ["reserve-date-info", id],
    queryFn: async () => {
      const res = await api.GET("/reserve/date-info/{reserveId}", {
        params: { path: { reserveId: id } },
      });

      const { response, data, error } = res;

      if (!response.ok && error) {
        toast.error(`Erro ${response.status}: ${error.message}`, {
          duration: 3000,
          position: "bottom-center",
          style: {
            color: "white",
            backgroundColor: "red",
            borderColor: "red",
          },
        });
        throw error;
      }

      return data;
    },
    enabled: open,
  });

  useEffect(() => {
    if (!isLoadingDates && data) {
      const from = parseISO(data.dateFrom);
      const to = parseISO(data.dateTo);
      setDateRange({ from, to });
      form.setFieldValue("dateFrom", from);
      form.setFieldValue("dateTo", to);
    }
  }, [isLoadingDates, data]);

  // ── Formulário ─────────────────────────────────────────────────────────────
  const form = useForm({
    defaultValues: {
      dateFrom: new Date(),
      dateTo: new Date(),
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const res = await api.PATCH("/reserve/edit-date/{reserveId}", {
        params: { path: { reserveId: id } },
        body: {
          dateFrom: format(value.dateFrom, "yyyy-MM-dd"),
          dateTo: format(value.dateTo, "yyyy-MM-dd"),
        },
      });

      const { response, error } = res;

      if (!response.ok && error) {
        toast.error(`Erro ${response.status}: ${error.message}`, {
          duration: 3000,
          position: "bottom-center",
          style: { color: "white", backgroundColor: "red", borderColor: "red" },
        });
        return;
      }

      toast.success("Data da reserva atualizada com sucesso!", {
        duration: 3000,
        position: "bottom-center",
        style: { color: "white", backgroundColor: "green", borderColor: "green" },
      });
      handleClose();
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleClose() {
    form.reset();
    setDateRange(undefined);
    onOpenChange(false);
  }

  function handleDateSelect(range: DateRange | undefined) {
    setDateRange(range);
    if (range?.from) form.setFieldValue("dateFrom", range.from);
    if (range?.to) form.setFieldValue("dateTo", range.to);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
        {/* ── Cabeçalho ── */}
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <PencilIcon className="text-purple-600 dark:text-purple-400" size={18} />
              <span>Alterar data da reserva</span>
            </div>
          </DialogTitle>

          {/* Identificação da reserva: nome — descrição */}
          <DialogDescription>
            <p className="text-xs text-muted-foreground">
              {name} — {description}
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* ── Formulário ── */}
        <form
          id="history-edit-form"
          name="history-edit-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="dateFrom"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field>
                    <FieldLabel htmlFor="history-date-picker-range">Nova data</FieldLabel>

                    {/* Date range picker desabilitado até a API retornar os dados */}
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            id="history-date-picker-range"
                            className="justify-start px-2.5 font-normal w-full"
                            disabled={isLoadingDates}
                          >
                            <CalendarIcon data-icon="inline-start" />
                            {isLoadingDates ? (
                              <span className="text-muted-foreground">Carregando datas...</span>
                            ) : dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                                </>
                              ) : (
                                format(dateRange.from, "dd/MM/yyyy")
                              )
                            ) : (
                              <span className="text-muted-foreground">Selecione o período</span>
                            )}
                          </Button>
                        }
                      />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from ?? tomorrow}
                          selected={dateRange}
                          disabled={{ before: tomorrow }}
                          onSelect={handleDateSelect}
                          numberOfMonths={1}
                        />
                      </PopoverContent>
                    </Popover>

                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>

        {/* ── Rodapé com ações ── */}
        <DialogFooter className="flex bg-transparent border-t pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>

          {/* Botão desabilitado enquanto carrega datas ou o formulário está submetendo */}
          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <Button type="submit" form="history-edit-form" disabled={isLoadingDates || isSubmitting}>
                Salvar
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
