<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui';
import { RefSymbol } from '@vue/reactivity';
import type { SpaceQuery } from '~~/types/index';

const emit = defineEmits<{
    (e: 'onQuery', filters: SpaceQuery): void
}>()

const query = ref('')
const capacity = ref<number>(0)
const resourceItems = ref<SelectMenuItem[]>([
    {
        type: 'item',
        label: 'Computadores',
        icon: 'uil:desktop'
    },
    {
        type: 'item',
        label: 'Telão',
        icon: 'uil:monitor'
    },
    {
        type: 'item',
        label: 'Tubos de Ensaio',
        icon: 'i-lucide-test-tube'
    }
])
const resourceValues = ref<{
    label: string;
    icon: string;
}[]>([])

// Watch for variable changes and emit callback
watch([query, resourceValues, capacity], () => {
    emit('onQuery', {
        query: query.value,
        resources: resourceValues.value.map((resource) => resource.label.toLowerCase()),
        capacity: capacity.value
    })
}, { deep: true })
</script>

<template>
    <div class="w-full max-w-5xl mx-auto">
        <div class="bg-white rounded-[24px] border border-black/10 shadow-sm p-6 hover:shadow-md">
            <!-- Title & Subtitle -->
            <div class="mb-4">
                <h1 class="text-lg font-bold text-neutral-900 tracking-tight">Reserva de Laboratório</h1>
                <p class="text-neutral-500 text-sm mt-2">Pesquise e filtre os espaços disponíveis.</p>
            </div>

            <!-- Filters Row -->
            <div class="flex flex-col md:flex-row gap-4 items-stretch">
                <!-- Search Input -->
                <div class="w-full">
                    <UInput v-model="query" icon="i-lucide-search" placeholder="Buscar por laboratório ou sala..."
                        id="spaces-query-form" size="md" class="w-full" />
                </div>

                <!-- Resources Dropdown (Multi-select) -->
                <div class="w-full md:w-auto">
                    <USelectMenu v-model="resourceValues" :items="resourceItems" multiple placeholder="Recursos..."
                        icon="i-lucide-filter" size="md" value-attribute="value" option-attribute="label"
                        class="min-w-[200px] w-full md:max-w-[200px]" :ui="{
                            base: 'rounded-full'

                        }" :search-input="{
                            ui: {
                                base: 'rounded-none shadow-black/7'
                            }
                        }" />
                </div>

                <!-- Capacity / Places Input -->
                <div class="w-full md:w-auto">
                    <UInput v-model="capacity" icon="i-lucide-users" placeholder="Lotação..." type="number" size="md"
                        variant="outline" class="w-full" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
