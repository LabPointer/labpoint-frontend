import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isToday } from "date-fns"
import { CalendarIcon, Users, Cog, TestTube, Clock, Loader2, AlertCircle } from "lucide-react"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"

interface Reserve {
    id: string;
    createdAt: string;
    startAt: string;
    endAt: string;
    spaceName: string;
}

interface ReserveFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    spaceName?: string
    capacity?: number
    resources?: string
}

export function ReserveForm({ open, onOpenChange, spaceName = "", capacity = 1, resources = "" }: ReserveFormProps) {
    const queryClient = useQueryClient()

    const form = useForm({
        defaultValues: {
            date: new Date(),
            startTime: "",
            endTime: "",
        },
        onSubmit: async ({ value }) => {
            if (!spaceName) return;

            const startStr = `${format(value.date, "yyyy-MM-dd")}T${value.startTime}:00`;
            const endStr = `${format(value.date, "yyyy-MM-dd")}T${value.endTime}:00`;

            const s = new Date(startStr);
            const e = new Date(endStr);

            try {
                const res = await fetch(`/api/reserve/create/${encodeURIComponent(spaceName)}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        startAt: s.toISOString(),
                        endAt: e.toISOString(),
                    })
                });
                
                const data = await res.json();
                
                if (!res.ok || data.status === "error") {
                    alert(data.message || "Erro ao solicitar reserva.");
                    form.setFieldValue("startTime", "");
                    form.setFieldValue("endTime", "");
                } else {
                    alert("Reserva confirmada com sucesso!");
                    queryClient.invalidateQueries({ queryKey: ["spaces"] });
                    queryClient.invalidateQueries({ queryKey: ["reserves", spaceName] });
                    onOpenChange(false);
                }
            } catch (err) {
                alert("Erro ao se conectar ao servidor.");
                form.setFieldValue("startTime", "");
                form.setFieldValue("endTime", "");
            }
        },
    })

    // Reset date/times when form opens
    useEffect(() => {
        if (open) {
            form.reset()
            form.setFieldValue("date", new Date())
            form.setFieldValue("startTime", "")
            form.setFieldValue("endTime", "")
        }
    }, [open, form])

    // Fetch existing reservations for the laboratory
    const reservesQuery = useQuery({
        queryKey: ["reserves", spaceName],
        queryFn: async () => {
            if (!spaceName) return [];
            const res = await fetch(`/api/reserves/${encodeURIComponent(spaceName)}`);
            const json = await res.json();
            if (!res.ok || json.status === "error") throw new Error(json.message);
            return (json.data?.foundReserves || []) as Reserve[];
        },
        enabled: open && !!spaceName,
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        Nova Reserva
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-4 py-4"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 bg-muted/40 border border-black/10 rounded-xl p-3 flex items-center gap-4 shadow-md">
                            <div className="bg-background p-2.5 rounded-lg border shadow-xs text-primary">
                                <TestTube className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Laboratório</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold truncate text-foreground">
                                        {spaceName ? spaceName.charAt(0).toUpperCase() + spaceName.slice(1) : ""}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/40 border border-black/10 rounded-xl p-3 flex items-center gap-3 overflow-hidden shadow-md">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-[9px] font-bold uppercase text-muted-foreground">Capacidade</p>
                                <p className="text-xs font-semibold">{capacity} lugares</p>
                            </div>
                        </div>

                        <div className="bg-muted/40 border border-black/10 rounded-xl p-3 flex items-center gap-3 overflow-hidden shadow-md">
                            <Cog className="w-4 h-4 text-muted-foreground" />
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-bold uppercase text-muted-foreground">Recursos</p>
                                <p className="text-xs font-semibold truncate">{resources || "Padrão"}</p>
                            </div>
                        </div>

                        <div className="col-span-2 h-px bg-border/50 my-1" />

                        <form.Field
                            name="date"
                            validators={{
                                onChange: ({ value }) =>
                                    !value ? "Selecione uma data" : undefined,
                            }}
                            children={(field) => (
                                <Field className="col-span-2">
                                    <FieldLabel className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                        <CalendarIcon className="w-3.5 h-3.5" /> Data da Reserva
                                    </FieldLabel>
                                    <Popover>
                                        <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left font-normal border border-black/20" />}>
                                            {field.state.value ? (
                                                format(field.state.value as Date, "dd/MM/yyyy")
                                            ) : (
                                                <span>Selecione uma data...</span>
                                            )}
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.state.value as Date}
                                                onSelect={(date) => field.handleChange(date || new Date())}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {field.state.meta.errors && (
                                        <FieldError errors={field.state.meta.errors.map(e => ({ message: String(e) }))} />
                                    )}
                                </Field>
                            )}
                        />

                        <form.Field
                            name="startTime"
                            validators={{
                                onChange: ({ value, fieldApi }) => {
                                    if (!value) return "Obrigatório"
                                    const selectedDate = fieldApi.form.getFieldValue("date") as Date
                                    if (selectedDate && isToday(selectedDate)) {
                                        const [h, m] = value.split(":")
                                        const sTime = new Date()
                                        sTime.setHours(Number(h), Number(m), 0, 0)
                                        if (sTime < new Date()) {
                                            return "Deve ser futuro"
                                        }
                                    }
                                    return undefined
                                }
                            }}
                            children={(field) => (
                                <Field>
                                    <FieldLabel className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                        <Clock className="w-3.5 h-3.5" /> Início
                                    </FieldLabel>
                                    <Input
                                        type="time"
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        className={`border ${field.state.meta.errors.length ? "border-red-500" : "border-black/20"}`}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors && (
                                        <FieldError errors={field.state.meta.errors.map(e => ({ message: String(e) }))} />
                                    )}
                                </Field>
                            )}
                        />

                        <form.Field
                            name="endTime"
                            validators={{
                                onChange: ({ value, fieldApi }) => {
                                    if (!value) return "Obrigatório"
                                    const startTimeStr = fieldApi.form.getFieldValue("startTime") as string
                                    if (startTimeStr) {
                                        const [sh, sm] = startTimeStr.split(":")
                                        const [eh, em] = value.split(":")
                                        const sMins = Number(sh) * 60 + Number(sm)
                                        const eMins = Number(eh) * 60 + Number(em)
                                        if (eMins <= sMins) {
                                            return "Deve ser após início"
                                        }
                                    }
                                    return undefined
                                }
                            }}
                            children={(field) => (
                                <Field>
                                    <FieldLabel className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                        <Clock className="w-3.5 h-3.5" /> Término
                                    </FieldLabel>
                                    <Input
                                        type="time"
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        className={`border ${field.state.meta.errors.length ? "border-red-500" : "border-black/20"}`}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors && (
                                        <FieldError errors={field.state.meta.errors.map(e => ({ message: String(e) }))} />
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting, state.values]}
                        children={([canSubmit, isSubmitting, values]) => {
                            const { date, startTime, endTime } = values as { date: Date | null, startTime: string, endTime: string };

                            const selectedDateStr = date ? format(date, "yyyy-MM-dd") : null;
                            let conflictingReserveId: string | null = null;

                            let sTimeObj: Date | null = null;
                            let eTimeObj: Date | null = null;

                            if (date && startTime && endTime) {
                                sTimeObj = new Date(`${format(date, "yyyy-MM-dd")}T${startTime}:00`);
                                eTimeObj = new Date(`${format(date, "yyyy-MM-dd")}T${endTime}:00`);
                            }

                            const filteredAndSortedReserves = (reservesQuery.data || [])
                                .filter(r => format(new Date(r.startAt), "yyyy-MM-dd") === selectedDateStr)
                                .map(r => {
                                    const rStart = new Date(r.startAt);
                                    const rEnd = new Date(r.endAt);
                                    let isConflict = false;

                                    if (sTimeObj && eTimeObj && sTimeObj < eTimeObj) {
                                        if (rStart < eTimeObj && rEnd > sTimeObj) {
                                            isConflict = true;
                                            conflictingReserveId = r.id;
                                        }
                                    }
                                    return {
                                        ...r,
                                        rStart,
                                        rEnd,
                                        isConflict
                                    };
                                })
                                .sort((a, b) => {
                                    if (a.isConflict) return -1;
                                    if (b.isConflict) return 1;
                                    return a.rStart.getTime() - b.rStart.getTime();
                                });

                            const isFilled = date && startTime && endTime;
                            const isBtnDisabled = !canSubmit || !isFilled || !!conflictingReserveId;

                            return (
                                <>
                                    <div className="pt-4 border-t border-black/10">
                                        <h3 className="text-[10px] font-bold mb-3 text-muted-foreground uppercase tracking-widest px-1">
                                            Reservas do dia selecionado
                                        </h3>
                                        <ScrollArea className="h-40 w-full rounded-lg border border-black/15 shadow-md bg-muted/30">
                                            <div className="p-3">
                                                {reservesQuery.isLoading || reservesQuery.isFetching ? (
                                                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                                                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                                        <p className="text-xs">Buscando reservas...</p>
                                                    </div>
                                                ) : reservesQuery.error ? (
                                                    <div className="flex flex-col items-center justify-center p-3 bg-red-50 text-red-600 border border-red-200 rounded-md">
                                                        <AlertCircle className="w-5 h-5 mb-1" />
                                                        <p className="text-xs text-center font-medium">Erro ao carregar reservas.</p>
                                                    </div>
                                                ) : filteredAndSortedReserves.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {filteredAndSortedReserves.map((res) => (
                                                            <div key={res.id} className={`flex flex-col gap-1.5 p-3 rounded-lg border shadow-xs transition-colors hover:bg-muted/50 ${res.isConflict ? "bg-red-50 border-red-300 border-l-4 border-l-red-600" : "bg-background border-black/10 border-l-4 border-l-indigo-600"}`}>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarIcon className={`w-3.5 h-3.5 ${res.isConflict ? "text-red-600" : "text-primary"}`} />
                                                                        <span className="text-[11px] font-bold text-foreground">
                                                                            {format(res.rStart, "dd/MM/yyyy")}
                                                                        </span>
                                                                    </div>
                                                                    {res.isConflict && <span className="text-[10px] font-bold text-red-600">Conflito de Horário!</span>}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                                    <span className="text-[11px] font-medium font-mono">
                                                                        {format(res.rStart, "HH:mm")} - {format(res.rEnd, "HH:mm")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center py-8 text-neutral-500">
                                                        <p className="text-xs font-semibold">Horários livres neste dia.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <div className="pt-4 border-black/20">
                                        <div className="flex flex-row w-full gap-3">
                                            <Button variant="destructive" className="flex-1 cursor-pointer border border-red-600/20 shadow-inner" type="button" onClick={() => onOpenChange(false)}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="flex-1 cursor-pointer" disabled={isBtnDisabled as boolean}>
                                                {isSubmitting ? "Confirmando..." : "Confirmar Reserva"}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )
                        }}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}
