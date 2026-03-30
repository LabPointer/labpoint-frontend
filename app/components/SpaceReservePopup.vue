<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, today, type DateValue } from '@internationalized/date'
import type { CheckboxGroupItem, FormError, FormSubmitEvent, SelectMenuItem } from '@nuxt/ui';
import z from 'zod';
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import type { Reservation } from '~/types';

// Props and emits

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmOrGreater = breakpoints.greaterOrEqual('sm')

const props = defineProps<{
    spaceName: string
    capacity: number
    resources: string[]
}>()

const emit = defineEmits<{
    (e: 'onClose'): void
}>()

// Form data

const schema = z.object({
    date: z.any().refine((value) => {
        return value instanceof CalendarDate
    }, "Selecione uma data para a reserva")
        .transform((value) => {
            return value as CalendarDate
        }),
    times: z.array(z.object({
        label: z.string("Horário inválido"),
        value: z.object({
            start: z.string("Horário inválido"),
            end: z.string("Horário inválido"),
        }),
    }), "Horário inválido"),
})

type Schema = z.output<typeof schema>

const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium'
})

const modelValue = (function() {
    const date = new Date()
    return shallowRef(new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()))
})()

const inputDate = useTemplateRef('inputDate')

const state = reactive<Partial<Schema>>({
    date: modelValue.value,
    times: [],
})

function isDateDisabled(date: DateValue) {
    return date.compare(today(getLocalTimeZone())) < 0
}

const items = ref<SelectMenuItem[]>([
    { type: 'label', label: 'Matutino' },
    { label: '07:30 - 08:30', value: { start: '07:30', end: '08:30' } },
    { label: '08:30 - 09:30', value: { start: '08:30', end: '09:30' } },
    { label: '09:30 - 10:30', value: { start: '09:30', end: '10:30' } },
    { label: '10:30 - 11:30', value: { start: '10:30', end: '11:30' } },
    { label: '11:30 - 12:30', value: { start: '11:30', end: '12:30' } },
    { type: 'separator' },
    { type: 'label', label: 'Vespertino', },
    { label: '13:00 - 14:00', value: { start: '13:00', end: '14:00' } },
    { label: '14:00 - 15:00', value: { start: '14:00', end: '15:00' } },
    { label: '15:00 - 16:00', value: { start: '15:00', end: '16:00' } },
    { label: '16:00 - 17:00', value: { start: '16:00', end: '17:00' } },
    { label: '17:00 - 18:00', value: { start: '17:00', end: '18:00' } },
    { type: 'separator' },
    { type: 'label', label: 'Noturno' },
    { label: '18:30 - 19:30', value: { start: '18:30', end: '19:30' } },
    { label: '19:30 - 20:30', value: { start: '19:30', end: '20:30' } },
    { label: '20:30 - 21:30', value: { start: '20:30', end: '21:30' } },
    { label: '21:30 - 22:30', value: { start: '21:30', end: '22:30' } },
])

const checkItems = ref<CheckboxGroupItem[]>([
    {
        label: 'Dia inteiro',
        value: 'dia-inteiro'
    },
    {
        label: 'Matutino',
        value: 'matutino'
    },
    {
        label: 'Vespertino',
        value: 'vespertino'
    },
    {
        label: 'Noturno',
        value: 'noturno'
    }
])
const checkValue = ref<string[]>([])
const isSyncing = ref(false)

type TimeSlot = { label: string, value: { start: string, end: string } }

const isSameSlot = (a: TimeSlot['value'], b: TimeSlot['value']) => a.start === b.start && a.end === b.end

const timeGroups: Record<string, TimeSlot[]> = {
    'Matutino': items.value.slice(1, 6) as TimeSlot[],
    'Vespertino': items.value.slice(8, 13) as TimeSlot[],
    'Noturno': items.value.slice(15, 19) as TimeSlot[]
}

const normalizeTime = (t: string | undefined): string => {
    if (!t) return "";
    const parts = t.split(':');
    console.log(parts)
    if (parts.length >= 2) {
        return `${parts[0]?.padStart(2, '0')}:${parts[1]?.padStart(2, '0')}`;
    }
    return t;
}

const isSlotDisabled = (slot: TimeSlot) => {
    const reservationList = (reservations.value ?? []) as Reservation[]
    const isReserved = reservationList.some((r: Reservation) => {
        if (!slot.value) return false;
        return normalizeTime(r.startAt) === normalizeTime(slot.value.start) &&
               normalizeTime(r.endAt) === normalizeTime(slot.value.end);
    })
    return isLoadingReservations.value || isFetchFailed.value || isReserved;
}

// Fetch data — reactive to selected date
const toast = useToast()

const reservationDate = computed(() => {
    if (!state.date) return null
    const d = state.date as CalendarDate
    // Format as YYYY-MM-DD for the API
    return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
})

const isLoadingReservations = ref(false)
const isFetchFailed = ref(false)

const { data: reservations, error: reservationError, refresh: refreshReservations } = await useFetch<any>(
    () => `http://localhost:3001/reserves/${props.spaceName}/${reservationDate.value}`,
    {
        lazy: true,
        immediate: false,
        transform: (response: any) => {
            if (response.status === 'error') {
                throw new Error(response.message || 'Erro na API');
            }
            return (response.data?.foundReserves ?? []) as Reservation[];
        },
        onRequest() {
            isLoadingReservations.value = true
            isFetchFailed.value = false
            // Clear selections while loading
            state.times = []
            checkValue.value = []
        },
        onResponse() {
            isLoadingReservations.value = false
        },
        onResponseError({ response }) {
            isLoadingReservations.value = false
            if (response.status === 404 || response.status === 204) {
                return;
            }
            isFetchFailed.value = true
            toast.error({
                title: 'Erro ao buscar horários',
                message: response._data?.message || 'Não foi possível carregar os horários reservados.',
                position: 'bottomCenter',
            } as any)
        },
    }
)

// Watch for error state (network failures, etc.)
watch(reservationError, (err) => {
    if (err) {
        isLoadingReservations.value = false
        // Ignore 404 as it just means no reservations yet
        if (err.statusCode === 404 || err.statusCode === 204) {
            return;
        }
        isFetchFailed.value = true
        toast.error({
            title: 'Erro ao buscar horários',
            message: err.message || 'Não foi possível carregar os horários reservados.',
            position: 'bottomCenter',
        } as any)
    }
})

// Re-fetch when date changes (only if date is not null)
watch(() => state.date, (newDate) => {
    if (newDate) {
        refreshReservations()
    }
}, { immediate: true })

const timeItems = computed<SelectMenuItem[]>(() => {
    return (items.value as any[]).map((item: any): SelectMenuItem => {
        if (!item || typeof item !== 'object') return item;
        // Keep labels/separators as-is
        if ('type' in item && (item.type === 'label' || item.type === 'separator')) return item

        const slot = item as unknown as TimeSlot
        if (!slot.value) return item

        return {
            ...item,
            disabled: isSlotDisabled(slot),
        }
    })
})

// Sync checkboxes from state.times
watch(() => state.times, (newTimes) => {
    if (!newTimes) return;

    const matutinoList = timeGroups['Matutino']?.filter(slot => !isSlotDisabled(slot)) || []
    const vespertinoList = timeGroups['Vespertino']?.filter(slot => !isSlotDisabled(slot)) || []
    const noturnoList = timeGroups['Noturno']?.filter(slot => !isSlotDisabled(slot)) || []

    const allSlots = [...matutinoList, ...vespertinoList, ...noturnoList]
    const isFullDay = allSlots.length > 0 && allSlots.every(s => s?.value && newTimes.some(t => isSameSlot(t.value, s.value)))
    const isMatutinoAll = matutinoList.length > 0 && matutinoList.every(s => s?.value && newTimes.some(t => isSameSlot(t.value, s.value)))
    const isVespertinoAll = vespertinoList.length > 0 && vespertinoList.every(s => s?.value && newTimes.some(t => isSameSlot(t.value, s.value)))
    const isNoturnoAll = noturnoList.length > 0 && noturnoList.every(s => s?.value && newTimes.some(t => isSameSlot(t.value, s.value)))

    const newCheckValue: string[] = []
    if (isFullDay) {
        newCheckValue.push('dia-inteiro', 'matutino', 'vespertino', 'noturno')
    } else {
        if (isMatutinoAll) newCheckValue.push('matutino')
        if (isVespertinoAll) newCheckValue.push('vespertino')
        if (isNoturnoAll) newCheckValue.push('noturno')
    }

    const currentCheckValue = checkValue.value || [];
    if (newCheckValue.length !== currentCheckValue.length || !newCheckValue.every(v => currentCheckValue.includes(v))) {
        isSyncing.value = true;
        checkValue.value = newCheckValue;
    }
}, { deep: true })

watch(checkValue, (newVal, oldVal) => {
    if (isSyncing.value) {
        isSyncing.value = false;
        return;
    }

    if (!newVal) newVal = []
    if (!oldVal) oldVal = []

    const added = newVal.filter(c => !oldVal.includes(c));
    const removed = oldVal.filter(c => !newVal.includes(c));

    let nextTimes = [...(state.times || [])];

    const matutinoList = timeGroups['Matutino']?.filter(slot => !isSlotDisabled(slot)) || []
    const vespertinoList = timeGroups['Vespertino']?.filter(slot => !isSlotDisabled(slot)) || []
    const noturnoList = timeGroups['Noturno']?.filter(slot => !isSlotDisabled(slot)) || []
    const allSlots = [...matutinoList, ...vespertinoList, ...noturnoList]

    if (added.includes('dia-inteiro')) {
        allSlots.forEach(slot => {
            if (!nextTimes.some(t => isSameSlot(t.value, slot.value))) nextTimes.push(slot);
        });
    } else if (removed.includes('dia-inteiro')) {
        allSlots.forEach(slot => {
            nextTimes = nextTimes.filter(t => !isSameSlot(t.value, slot.value));
        });
    } else {
        added.forEach(val => {
            let slotsToAdd: TimeSlot[] = [];
            if (val === 'matutino') slotsToAdd = matutinoList;
            else if (val === 'vespertino') slotsToAdd = vespertinoList;
            else if (val === 'noturno') slotsToAdd = noturnoList;

            slotsToAdd.forEach(slot => {
                if (!nextTimes.some(t => isSameSlot(t.value, slot.value))) nextTimes.push(slot);
            });
        });

        removed.forEach(val => {
            let slotsToRemove: TimeSlot[] = [];
            if (val === 'matutino') slotsToRemove = matutinoList;
            else if (val === 'vespertino') slotsToRemove = vespertinoList;
            else if (val === 'noturno') slotsToRemove = noturnoList;

            slotsToRemove.forEach(slot => {
                nextTimes = nextTimes.filter(t => !isSameSlot(t.value, slot.value));
            });
        });
    }

    state.times = nextTimes;
})

// Callbacks

function onReset() {
    state.times = []
    state.date = new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
}

function onClose() {
    onReset()
    emit('onClose')
}

function validate(state: Partial<Schema>): FormError[] {
    const errors: FormError[] = []
    if (!state.date) errors.push({ name: 'date', message: 'Selecione uma data para a reserva' })
    console.log(state.date?.toDate(getLocalTimeZone()))
    if (state.date) {
        const selectedDate = state.date as CalendarDate;
        if (selectedDate.compare(today(getLocalTimeZone())) < 0) {
            errors.push({ name: 'date', message: 'A data não pode ser anterior ao dia de hoje' })
        }
    }

    const timesCount = state.times?.length || 0

    if (timesCount === 0) {
        const message = 'Selecione pelo menos um horário em um dos períodos'
        errors.push({ name: 'times', message })
    }
    return errors
}
const isLoadingSubmit = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
    isLoadingSubmit.value = true
    try {
        const dateStr = `${event.data.date.year}-${String(event.data.date.month).padStart(2, '0')}-${String(event.data.date.day).padStart(2, '0')}`
        
        const promises = event.data.times.map(time => {
            return $fetch(`http://localhost:3001/reserve/create/${encodeURIComponent(props.spaceName)}`, {
                method: 'POST',
                body: {
                    date: dateStr,
                    startAt: time.value.start + ':00', // Add seconds to match the likely API requirement
                    endAt: time.value.end + ':00'
                }
            })
        })

        await Promise.all(promises)

        toast.success({ title: 'Reserva realizada com sucesso!', position: 'bottomCenter' })
        
        // Refresh items and close or reset
        refreshReservations()
        onReset()
        emit('onClose')
    } catch (error: any) {
        let errorMsg = 'Não foi possível concluir a reserva.'
        if (error.response && error.response._data && error.response._data.message) {
            errorMsg = error.response._data.message
        } else if (error.message) {
            errorMsg = error.message
        }
        toast.error({
            title: 'Erro ao reservar',
            message: errorMsg,
            position: 'bottomCenter'
        } as any)
    } finally {
        isLoadingSubmit.value = false
    }
}
</script>

<template>
    <div class="w-lg px-5 z-50">
        <UForm class="space-y-4 p-4 rounded-2xl bg-white" :schema="schema" :validate="validate" @reset="onReset"
            :validate-on="['change', 'input']" :state="state" @submit="onSubmit">
            <div class="w-full flex flex-col gap-y-4">
                <div class="flex items-center gap-x-2">
                    <Icon name="i-lucide-calendar" class="w-5 h-5 text-indigo-600" />
                    <h1 class="text-xl font-bold text-neutral-900">Nova reserva</h1>
                    <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="ml-auto" @click="onClose()" />
                </div>
                <div class="flex items-center gap-x-4 shadow-md shadow-black/15 rounded-lg p-2 ring-1 ring-black/8">
                    <div class="flex items-center justify-center bg-indigo-500/20 p-2 rounded-lg shadow-inner">
                        <Icon name="i-lucide-monitor" class="w-5 h-5 text-indigo-600" />
                    </div>
                    <div class="flex flex-col">
                        <h2 class="text-[12px] font-bold text-neutral-500">LABORATORIO</h2>
                        <h2 class="text-[14px] font-bold text-neutral-600">{{ props.spaceName }}</h2>
                    </div>
                </div>
                <div
                    class="w-full flex flex-row max-[500px]:flex-wrap gap-x-4 max-[500px]:gap-y-2 items-center justify-between">
                    <div
                        class="w-full flex items-center gap-x-4 shadow-md shadow-black/15 rounded-lg p-2 ring-1 ring-black/8">
                        <Icon name="i-lucide-users" class="w-5 h-5 text-neutral-600" />
                        <div class="flex flex-col">
                            <h2 class="text-[11px] font-bold text-neutral-500">LOTAÇÃO</h2>
                            <h2 class="text-[12px] font-bold text-neutral-800">{{ props.capacity }} lugares</h2>
                        </div>
                    </div>
                    <div
                        class="w-full flex items-center gap-x-4 shadow-md shadow-black/15 rounded-lg p-2 ring-1 ring-black/8">
                        <Icon name="uil:box" class="w-5 h-5 text-neutral-600" />
                        <div class="flex flex-col">
                            <h2 class="text-[11px] font-bold text-neutral-500">RECURSOS</h2>
                            <h2 class="text-[12px] font-bold text-neutral-800">{{ props.resources.join(', ') }}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <UFormField label="Data da reserva" name="date" class="w-full" :ui="{}">
                <UInputDate ref="inputDate" :model-value="state.date as CalendarDate" 
                    class="w-full bg-white hover:bg-neutral-100 ring-1 ring-neutral-300 hover:ring-neutral-400 shadow-md" 
                    format="dd/MM/yyyy" locale="pt-BR"
                    :min-value="today(getLocalTimeZone())"
                    variant="subtle"
                    @change="(e) => {
                        
                    }"
                >
                    <template #trailing>
                        <UPopover :reference="inputDate?.inputsRef[3]?.$el">
                            <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar"
                                aria-label="Select a date" class="px-0" />

                            <template #content>
                                <UCalendar v-model="state.date as CalendarDate" class="p-2" 
                                    :is-date-disabled="isDateDisabled"
                                />
                            </template>
                        </UPopover>
                    </template>
                </UInputDate>
            </UFormField>

            <UFormField label="Horários" name="times" class="w-full gap-y-1 align-middle" :ui="{}">
                <div v-if="isLoadingReservations" class="flex items-center gap-x-2 text-sm text-indigo-600 mt-2 mb-1.5 font-medium">
                    <Icon name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
                    Buscando disponibilidade...
                </div>
                <div v-else-if="isFetchFailed" class="flex items-center gap-x-2 text-sm text-red-600 mt-2 mb-1.5 font-medium">
                    <Icon name="i-lucide-triangle-alert" class="w-4 h-4" />
                    Falha ao carregar horários. Tente novamente mais tarde.
                </div>

                <UCheckboxGroup v-model="checkValue" :items="checkItems" color="primary" :disabled="isLoadingReservations || isFetchFailed"
                    :orientation="isSmOrGreater ? 'horizontal' : 'vertical'" class="w-full my-2" />
                <USelectMenu v-model="state.times" icon="i-lucide-clock" multiple :items="timeItems" :disabled="isLoadingReservations || isFetchFailed" :ui="{
                    base: '',
                    leadingIcon: 'text-neutral-600'
                }" :search-input="{
                    ui: {
                        base: 'rounded-none shadow-black/7'
                    }
                }" class="w-full min-w-0 max-w-[calc(100vw-4rem)] sm:max-w-full">
                    <template #default>
                        <div class="truncate text-left flex-1 min-w-0 max-w-[calc(100vw-6rem)] sm:max-w-full">
                            {{state.times?.length ? state.times.map(t => typeof t === 'object' ? t.label : t).join(',') : 'Selecione os horários' }}
                        </div>
                    </template>
                </USelectMenu>
            </UFormField>

            <div class="w-full mt-10 flex flex-row gap-x-4 items-center justify-end">
                <UButton type="reset" color="secondary" variant="subtle">
                    Resetar
                </UButton>

                <UButton type="submit" :loading="isLoadingSubmit" class="bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-600">
                    Reservar
                </UButton>
            </div>
        </UForm>
    </div>
</template>