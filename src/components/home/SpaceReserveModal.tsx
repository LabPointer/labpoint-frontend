import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
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
import { Schedules } from "@/lib/service";
import { Checkbox } from "../ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "../ui/input-group";

type ListData = {
  id: number;
  name: string;
};

export type SpaceProps = {
  id: number;
  name: string;
  capacity: number;
  subjects?: ListData[] | undefined;
  locked: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const formSchema = z.object({
  date: z
    .date()
    .refine((date) => date >= startOfDay(addDays(new Date(), 1)), "A data da reserva deve começar a partir de amanhã."),
  schedules: z.array(z.string()).min(1, "Selecione pelo menos um horário."),
  purpose: z
    .string()
    .min(1, "Campo 'proposito' é obrigatório.")
    .max(100, "Proposito deve ter no máximo 100 caracteres."),
});

export function SpaceReserveModal(props: SpaceProps) {
  const { id, name, capacity, subjects, locked, open: controlledOpen, onOpenChange } = props;
  const api = useApi();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const handleOpenChange = (nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      form.reset();
      setDate(undefined);
    }
  };
  const [date, setDate] = useState<DateRange | undefined>();
  const scheduleKeys = Array.from(Schedules.keys());
  const firstAvailableDate = startOfDay(addDays(new Date(), 1));

  const form = useForm({
    defaultValues: {
      date: new Date(),
      schedules: [] as string[],
      purpose: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const res = await api.POST("/reserve/create/{spaceId}", {
        params: {
          path: { spaceId: id },
        },
        body: {
          dateFrom: format(date?.from ?? new Date(), "yyyy-MM-dd"),
          dateTo: format(date?.to ?? new Date(), "yyyy-MM-dd"),
          schedules: value.schedules as (
            | "M_AULA_1"
            | "M_AULA_2"
            | "M_AULA_3"
            | "M_AULA_4"
            | "M_AULA_5"
            | "V_AULA_1"
            | "V_AULA_2"
            | "V_AULA_3"
            | "V_AULA_4"
            | "V_AULA_5"
            | "N_AULA_1"
            | "N_AULA_2"
            | "N_AULA_3"
            | "N_AULA_4"
          )[],
          purpose: value.purpose,
        },
      });

      if (!res.response.ok && res.error) {
        toast.error(`"Erro ao criar reserva: ${res.response.statusText ?? "Erro desconhecido."}`, {
          duration: 3000,
          position: "bottom-center",
          style: {
            color: "white",
            backgroundColor: "red",
            borderColor: "red",
          },
        });
        return;
      }

      toast.success("Reserva criada com sucesso!", {
        duration: 3000,
        position: "bottom-center",
        style: {
          color: "white",
          backgroundColor: "green",
          borderColor: "green",
        },
      });
      form.reset();
      setDate(undefined);
      handleOpenChange(false);
    },
  });

  const { data: existingSchedules = [], isLoading } = useQuery({
    queryKey: [
      "space-existing-schedules",
      id,
      date?.from ? format(date.from, "yyyy-MM-dd") : null,
      date?.to ? format(date.to, "yyyy-MM-dd") : null,
    ],
    queryFn: async () => {
      const res = await api.GET(`/reserve/existing-schedules/{spaceId}`, {
        params: {
          path: { spaceId: id },
          query: {
            dateFrom: date?.from ? format(date.from, "yyyy-MM-dd") : "",
            dateTo: date?.to ? format(date.to, "yyyy-MM-dd") : "",
          },
        },
      });

      const {response, data, error} = res;

      if (!response.ok && error) {
        toast.error(`Error ${response.status}: ${error.message}`, {
          duration: 3000,
          position: "bottom-center",
          style: {
            color: "white",
            backgroundColor: "red",
            borderColor: "red",
          },
        });
        return;
      }

      return res.data;
    },
    enabled: Boolean(date?.from && date?.to),
  });

  const existingScheduleSet = new Set<string>(existingSchedules);
  const availableScheduleKeys = isLoading ? [] : scheduleKeys.filter((schedule) => !existingScheduleSet.has(schedule));

  return (
    <Dialog defaultOpen={false} open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center">
              <CalendarIcon className="text-purple-600 dark:text-purple-400" />
              <span className="ml-2">Nova reserva</span>
            </div>
          </DialogTitle>
          <DialogDescription>Defina as informações da sua reserva.</DialogDescription>
          <div className="flex items-center p-2 rounded-md border shadow-md dark:border-violet-400/20 dark:shadow-violet-400/20">
            <div className="flex flex-col items-start">
              <span className="text-base font-bold">{name}</span>
              <span className="text-xs text-muted-foreground">
                {subjects?.length ? subjects.map((s) => s.name).join(", ") : "---"} · {capacity} lugares
              </span>
            </div>
            <div className="ml-auto">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
              >
                {locked ? "Bloqueado" : "Disponível"}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        <form
          id="space-reserve-form"
          name="space-reserve-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {/*Data range*/}
          <FieldGroup>
            <form.Field
              name="date"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field className="mx-auto">
                    <FieldLabel htmlFor="date-picker-range">Data da reserva</FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button variant="outline" id="date-picker-range" className="justify-start px-2.5 font-normal">
                            <CalendarIcon data-icon="inline-start" />
                            {date?.from ? (
                              date.to ? (
                                <>
                                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(date.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Selecione a data da reserva</span>
                            )}
                          </Button>
                        }
                      />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={date?.from ?? firstAvailableDate}
                          selected={date}
                          disabled={{ before: firstAvailableDate }}
                          onSelect={(range) => {
                            const adjustedRange =
                              range?.from && range.to && range.to > addDays(range.from, 30)
                                ? { ...range, to: addDays(range.from, 30) }
                                : range;

                            setDate(adjustedRange);
                            if (adjustedRange?.from && adjustedRange.to) {
                              form.setFieldValue("schedules", []);
                              field.handleChange(new Date(adjustedRange.from));
                            }
                          }}
                          numberOfMonths={1}
                        />
                      </PopoverContent>
                    </Popover>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            {/*Horarios*/}
            <form.Field
              name="schedules"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Horários</FieldLabel>
                    <FieldGroup className="mx-auto">
                      <Field orientation="horizontal">
                        <Checkbox
                          className=""
                          disabled={availableScheduleKeys.length === 0 || isLoading || date?.to === undefined}
                          checked={
                            availableScheduleKeys.length > 0 &&
                            field.state.value.length === availableScheduleKeys.length
                          }
                          onCheckedChange={(checked) => field.handleChange(checked ? availableScheduleKeys : [])}
                        />
                        <FieldLabel
                          className={`text-sm font-medium ${date?.from === undefined ? "text-muted-foreground" : ""}`}
                        >
                          Selecionar tudo
                        </FieldLabel>
                      </Field>
                    </FieldGroup>
                    <Combobox
                      items={availableScheduleKeys}
                      multiple
                      value={field.state.value}
                      onValueChange={(schedules) => field.handleChange(schedules)}
                      itemToStringLabel={(key) => Schedules.get(key) ?? key}
                      disabled={isLoading || date?.to === undefined || availableScheduleKeys.length === 0}
                    >
                      <ComboboxChips>
                        <ComboboxValue>
                          {field.state.value.map((key) => (
                            <ComboboxChip key={key}>{Schedules.get(key) ?? key}</ComboboxChip>
                          ))}
                        </ComboboxValue>

                        <ComboboxChipsInput
                          placeholder={
                            date?.to === undefined
                              ? "Selecione o período primeiro"
                              : isLoading
                                ? "Carregando horários..."
                                : availableScheduleKeys.length === 0
                                  ? "Nenhum horário disponível"
                                  : "Selecione os horários"
                          }
                        />
                      </ComboboxChips>

                      <ComboboxContent>
                        <ComboboxEmpty>Nenhum horário encontrado.</ComboboxEmpty>
                        <ComboboxList>
                          {(key) => (
                            <ComboboxItem key={key} value={key}>
                              {Schedules.get(key) ?? key}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            {/*Aulas*/}
            <form.Field
              name="purpose"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Proposito</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Ex: Aula prática de Cálculo I, reunião pedagógica, palestra..."
                        rows={6}
                        className="min-h-20 resize-none"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.state.value.length}/100 caracteres
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
        <DialogFooter className="flex bg-transparent border-t">
          <Field className="ml-auto w-fit" orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setDate(undefined);
              }}
            >
              Limpar
            </Button>
            <Button type="submit" form="space-reserve-form" className="ml-2" disabled={isLoading}>
              Reservar
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
