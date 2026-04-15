<script setup lang="ts">
import { CalendarDate, getLocalTimeZone, today, type DateValue } from '@internationalized/date';
import type { CheckboxGroupItem, FormError, FormSubmitEvent, SelectMenuItem } from '@nuxt/ui';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { z } from 'zod';

// Props and emits
const emit = defineEmits<{
    (e: 'onClose'): void;
}>();

const open = defineModel<boolean>('open', { default: true })
const props = defineProps<SpaceInfo>()

// Toast
const toast = useToast()

// Date picker
const inputDate = useTemplateRef('inputDate')
const dateValue = shallowRef((() => {
    const date = today(getLocalTimeZone())
    return new CalendarDate(date.year, date.month, date.day)
})())

const isDateUnavailable = (date: DateValue) => {
    return date.compare(today(getLocalTimeZone())) < 0
}

// Prevent an empty data
watch(dateValue, (newVal, oldValue) => {
    if (!newVal && oldValue) {
        dateValue.value = oldValue
    } else if (newVal) {
        // Convert CalendarDate to zod Date
        state.data = newVal.toDate(getLocalTimeZone())
    }
})

// Shift groups
const morningSlots: HorarioData[] = ["M-Aula1", "M-Aula2", "M-Aula3", "M-Aula4", "M-Aula5"]
const afternoonSlots: HorarioData[] = ["V-Aula1", "V-Aula2", "V-Aula3", "V-Aula4", "V-Aula5"]
const nightSlots: HorarioData[] = ["N-Aula1", "N-Aula2", "N-Aula3", "N-Aula4"]
const allDaySlots: HorarioData[] = [...morningSlots, ...afternoonSlots, ...nightSlots]

// Shift slots
const turnosItems = computed<CheckboxGroupItem[]>(() => {
    const reservedSlots = new Set(reserves.value?.data?.data.foundReserves.flatMap(r => r.horarios) || [])

    return [
        {
            label: 'Dia inteiro',
            value: 'dia-inteiro',
            disabled: allDaySlots.some(s => reservedSlots.has(s))
        },
        {
            label: 'Manhã',
            value: 'manha',
            disabled: morningSlots.some(s => reservedSlots.has(s))
        },
        {
            label: 'Tarde',
            value: 'tarde',
            disabled: afternoonSlots.some(s => reservedSlots.has(s))
        },
        {
            label: 'Noite',
            value: 'noite',
            disabled: nightSlots.some(s => reservedSlots.has(s))
        }
    ]
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmOrGreater = breakpoints.greaterOrEqual('sm')
const orientation = computed(() => isSmOrGreater.value ? 'horizontal' : 'vertical')

// Times
const timesItems = computed<SelectMenuItem[]>(() => {
    const reservedSlots = new Set(reserves.value?.data?.data.foundReserves.flatMap(r => r.horarios) || [])

    return [
        { type: 'label', label: 'Matutino' },
        { type: 'item', label: '07:30 - 08:30', value: "M-Aula1", disabled: reservedSlots.has("M-Aula1") },
        { type: 'item', label: '08:30 - 09:30', value: "M-Aula2", disabled: reservedSlots.has("M-Aula2") },
        { type: 'item', label: '09:30 - 10:30', value: "M-Aula3", disabled: reservedSlots.has("M-Aula3") },
        { type: 'item', label: '10:30 - 11:30', value: "M-Aula4", disabled: reservedSlots.has("M-Aula4") },
        { type: 'item', label: '11:30 - 12:30', value: "M-Aula5", disabled: reservedSlots.has("M-Aula5") },
        { type: 'separator' },
        { type: 'label', label: 'Vespertino' },
        { type: 'item', label: '13:00 - 14:00', value: "V-Aula1", disabled: reservedSlots.has("V-Aula1") },
        { type: 'item', label: '14:00 - 15:00', value: "V-Aula2", disabled: reservedSlots.has("V-Aula2") },
        { type: 'item', label: '15:00 - 16:00', value: "V-Aula3", disabled: reservedSlots.has("V-Aula3") },
        { type: 'item', label: '16:00 - 17:00', value: "V-Aula4", disabled: reservedSlots.has("V-Aula4") },
        { type: 'item', label: '17:00 - 18:00', value: "V-Aula5", disabled: reservedSlots.has("V-Aula5") },
        { type: 'separator' },
        { type: 'label', label: 'Noturno' },
        { type: 'item', label: '18:30 - 19:30', value: "N-Aula1", disabled: reservedSlots.has("N-Aula1") },
        { type: 'item', label: '19:30 - 20:30', value: "N-Aula2", disabled: reservedSlots.has("N-Aula2") },
        { type: 'item', label: '20:30 - 21:30', value: "N-Aula3", disabled: reservedSlots.has("N-Aula3") },
        { type: 'item', label: '21:30 - 22:30', value: "N-Aula4", disabled: reservedSlots.has("N-Aula4") },
    ]
})

// Schema
const schema = z.object({
    data: z.date({ error: "Selecione uma data" }),
    turnos: z.array(z.string()),
    horarios: z.array(z.string()).min(1, "Selecione pelo menos um horário"),
})
type Schema = z.output<typeof schema>

const state = reactive<Schema>({
    data: today(getLocalTimeZone()).toDate(getLocalTimeZone()),
    turnos: [],
    horarios: [],
})

// Watch
let skipWatchTurnos = false
let skipWatchHorarios = false

watch(() => [...state.turnos], (newValue, oldValue) => {
    if (skipWatchTurnos) return
    skipWatchTurnos = true

    const diaInteiroChecked = newValue.includes('dia-inteiro') && !oldValue.includes('dia-inteiro')
    const diaInteiroUnchecked = !newValue.includes('dia-inteiro') && oldValue.includes('dia-inteiro')
    const turnosChecked = newValue.includes('manha') && newValue.includes('tarde') && newValue.includes('noite')
    const turnosUnchecked = (!newValue.includes('manha') || !newValue.includes('tarde') || !newValue.includes('noite')) && newValue.includes('dia-inteiro')

    if (diaInteiroChecked) {
        state.turnos = ["dia-inteiro", "manha", "tarde", "noite"]
    } else if (diaInteiroUnchecked) {
        state.turnos = []
        skipWatchHorarios = true
        state.horarios = []
        nextTick(() => { skipWatchHorarios = false })
    } else if (turnosChecked && !newValue.includes('dia-inteiro')) {
        state.turnos = ["dia-inteiro", "manha", "tarde", "noite"]
    } else if (turnosUnchecked) {
        state.turnos = state.turnos.filter((t) => t !== 'dia-inteiro')
    }

    // Sync horarios from turnos (skip the horarios watcher)
    skipWatchHorarios = true
    if (state.turnos.includes('dia-inteiro')) {
        state.horarios = [
            "M-Aula1", "M-Aula2", "M-Aula3", "M-Aula4", "M-Aula5",
            "V-Aula1", "V-Aula2", "V-Aula3", "V-Aula4", "V-Aula5",
            "N-Aula1", "N-Aula2", "N-Aula3", "N-Aula4"
        ]
    } else if (state.turnos.length > 0) {
        state.horarios = []
        if (state.turnos.includes('manha')) {
            state.horarios.push("M-Aula1", "M-Aula2", "M-Aula3", "M-Aula4", "M-Aula5")
        }
        if (state.turnos.includes('tarde')) {
            state.horarios.push("V-Aula1", "V-Aula2", "V-Aula3", "V-Aula4", "V-Aula5")
        }
        if (state.turnos.includes('noite')) {
            state.horarios.push("N-Aula1", "N-Aula2", "N-Aula3", "N-Aula4")
        }
    }
    nextTick(() => { skipWatchHorarios = false })

    nextTick(() => { skipWatchTurnos = false })
})

watch(() => [...state.horarios], () => {
    if (skipWatchHorarios) return
    skipWatchHorarios = true

    // When horarios are manually changed, just clear all turnos
    skipWatchTurnos = true
    state.turnos = []
    nextTick(() => { skipWatchTurnos = false })

    nextTick(() => { skipWatchHorarios = false })
})

// Fetch reserves
//const isFetchingReserves = ref(false)

const reserveParams = computed(() => {
    return {
        spaceName: `${props.name}`,
        date: `${state.data.toISOString().split('T')[0]}`,
    }
})

const { data: reserves, status, error: errorReserves, refresh, pending: isFetchingReserves } = useAsyncData("reserves", async () => {
    if (!open.value) return;
    const api = useFastify();
    const { data, error } = await api.GET(`/reserves/{spaceName}/{date}`, {
        params: {
            path: {
                spaceName: reserveParams.value.spaceName,
                date: reserveParams.value.date,
            }
        }
    });
    return { data, error };
}, {
    watch: [dateValue, open],
    immediate: true,
    lazy: true,
})

// Callbacks
const onResetCb = () => {
    state.turnos = []
    state.horarios = []
}

const onCloseCb = () => {
    onResetCb()
    emit('onClose')
}

const validateCb = async (): Promise<FormError[]> => {
    if (state.turnos.length === 0 && state.horarios.length === 0) {
        return [{ name: 'horarios', message: 'Selecione pelo menos um horário' }]
    }
    return []
}

const isLoadingSubmit = ref(false)

const onSubmitCb = async (event: FormSubmitEvent<Schema>) => {
    isLoadingSubmit.value = true

    const api = useFastify();
    const { error } = await api.POST(`/reserve/create/{spaceName}`, {
        params: {
            path: {
                spaceName: props.name,
            }
        },
        body: {
            date: `${event.data.data.toISOString().split('T')[0]}`,
            horarios: state.horarios,
        }
    })

    if (error) {
        toast.error({ title: 'Erro ao reservar', message: error.message, position: 'bottomCenter' })
        isLoadingSubmit.value = false
        return
    }

    toast.success({ title: 'Reserva realizada com sucesso!', position: 'bottomCenter' })

    // Refresh reserves first, then reset form
    await refresh()
    onResetCb()
    isLoadingSubmit.value = false
}
</script>

<template>
    <UModal v-model:open="open" title="Nova reserva" description="Selecione a data e os horários para realizar sua reserva.">
        <template #header>
            <Icon name="i-lucide-calendar" class="w-5 h-5 text-indigo-600" />
            <h2 class="text-xl font-bold text-neutral-900">Nova reserva</h2>
            <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-x" class="ml-auto rounded-full"
                @click="onCloseCb" />
        </template>
        <template #body>
            <div class="flex flex-col gap-y-4">
                <div class="w-full flex flex-col gap-y-4">
                    <div class="flex items-center gap-x-4 shadow-md shadow-black/15 rounded-lg p-2 ring-1 ring-black/8">
                        <div class="flex items-center justify-center bg-indigo-500/20 p-2 rounded-lg shadow-inner">
                            <Icon name="i-lucide-monitor" class="w-5 h-5 text-indigo-600" />
                        </div>
                        <div class="flex flex-col min-w-0">
                            <h2 class="text-[12px] font-bold text-neutral-500">LABORATORIO</h2>
                            <h2 class="text-[14px] font-bold text-neutral-600 truncate">{{
                                props.name.charAt(0).toUpperCase() + props.name.slice(1) }}</h2>
                        </div>
                    </div>
                    <div
                        class="w-full flex flex-row max-[500px]:flex-wrap gap-x-4 max-[500px]:gap-y-2 items-center justify-between">
                        <div
                            class="min-[500px]:flex-1 min-w-0 max-[500px]:w-full flex items-center gap-x-4 shadow-md shadow-black/15 rounded-lg p-2 ring-1 ring-black/8">
                            <Icon name="i-lucide-users" class="w-5 h-5 text-neutral-600 shrink-0" />
                            <div class="flex flex-col min-w-0">
                                <h2 class="text-[11px] font-bold text-neutral-500">LOTAÇÃO</h2>
                                <h2 class="text-[12px] font-bold text-neutral-800 truncate">{{ props.capacity }} lugares
                                </h2>
                            </div>
                        </div>

                        <div
                            class="min-[500px]:flex-1 min-w-0 max-[500px]:w-full flex items-center gap-x-4 shadow-md shadow-black/15 rounded-lg p-2 ring-1 ring-black/8">
                            <Icon name="uil:box" class="w-5 h-5 text-neutral-600 shrink-0" />
                            <div class="flex flex-col min-w-0">
                                <h2 class="text-[11px] font-bold text-neutral-500 truncate">RECURSOS</h2>
                                <h2 class="text-[12px] font-bold text-neutral-800 truncate">
                                    {{ props.resources.join(',') }}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
                <UForm v-if="!errorReserves" :state="state" :schema="schema" class="space-y-4 rounded-2xl bg-white"
                    @reset="onResetCb" @submit="onSubmitCb" :validate="validateCb">
                    <!-- Date field -->
                    <UFormField label="Data da reserva" name="date" class="w-full" :ui="{}">
                        <UInputDate ref="inputDate" v-model="dateValue" locale="pt-BR"
                            :min-date="today('America/Sao_Paulo')" :is-date-unavailable="isDateUnavailable"
                            :disabled="isFetchingReserves || isLoadingSubmit"
                            :loading="isFetchingReserves || isLoadingSubmit"
                            class="w-full bg-white hover:bg-neutral-100 ring-1 ring-neutral-300 hover:ring-neutral-400 shadow-md"
                            variant="subtle">
                            <template #trailing>
                                <UPopover :reference="inputDate?.inputsRef[3]?.$el">
                                    <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar"
                                        aria-label="Select a date" class="px-0" />

                                    <template #content>
                                        <UCalendar v-model="dateValue" class="p-2"
                                            :is-date-unavailable="isDateUnavailable" />
                                    </template>
                                </UPopover>
                            </template>
                        </UInputDate>
                    </UFormField>

                    <!-- Time field -->
                    <UFormField label="Selecionar por turno" name="shift" :loading="isFetchingReserves">
                        <UCheckboxGroup v-model="state.turnos" :items="turnosItems" :orientation="orientation"
                            :disabled="isFetchingReserves || isLoadingSubmit"
                            :loading="isFetchingReserves || isLoadingSubmit" />
                    </UFormField>

                    <UFormField label="Horários" :required="true" name="times" class="w-full">
                        <USelectMenu v-model="state.horarios" icon="i-lucide-clock" multiple :items="timesItems"
                            :disabled="isFetchingReserves || isLoadingSubmit"
                            :loading="isFetchingReserves || isLoadingSubmit" value-key="value" label-key="label" :ui="{
                                base: '',
                                leadingIcon: 'text-neutral-600'
                            }" :search-input="{
                                ui: {
                                    base: 'rounded-none shadow-black/7'
                                }
                            }" class="w-full flex-1 min-w-0 max-w-[calc(100vw-4rem)] sm:max-w-full" />
                    </UFormField>

                    <UFieldGroup orientation="horizontal" class="flex justify-end">
                        <UButton type="reset" color="secondary" variant="subtle"
                            :disabled="isFetchingReserves || isLoadingSubmit">
                            Limpar
                        </UButton>

                        <UButton type="submit" class="bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-600"
                            :disabled="!state.data || state.horarios.length === 0 || isFetchingReserves || isLoadingSubmit"
                            :loading="isLoadingSubmit || isFetchingReserves">
                            Reservar
                        </UButton>
                    </UFieldGroup>
                </UForm>
                <div v-else
                    class="bg-red-50 border border-red-200 text-red-700 p-5 rounded-[16px] flex items-start gap-4 shadow-sm">
                    <Icon name="i-lucide-alert-circle" class="w-6 h-6 mt-0.5 shrink-0" />
                    <div>
                        <h4 class="font-bold text-base">Erro ao conectar com a API</h4>
                        <p class="text-[13px] mt-1 opacity-90">Não foi possível buscar as informações. Certifique-se de
                            que a API está
                            rodando no localhost e de que a URL está correta. (Detalhe: {{ errorReserves.message }})</p>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>