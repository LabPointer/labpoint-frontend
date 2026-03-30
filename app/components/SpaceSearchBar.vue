<script setup lang="ts">
import type { SpaceQuery } from '~/types/spaces';

const emit = defineEmits<{
    (e: 'onQuery', filters: SpaceQuery): void
}>()

const query = ref('')
const selectedResources = ref<{
    label: string;
    value: string;
    icon: string;
}[]>([])
const capacity = ref<number>(0)

const resources = [
    { label: 'Computadores', value: 'computadores', icon: 'i-lucide-monitor' },
    { label: 'Telão', value: 'telão', icon: 'i-lucide-projector' },
    { label: 'Tubo de Ensaio', value: 'tubos de ensaio', icon: 'i-lucide-test-tube' }
]

// Monitora as alterações nas ref e emite um evento de callback com os objetos atuais
watch([query, selectedResources, capacity], () => {
    emit('onQuery', {
        query: query.value,
        resources: selectedResources.value.map(r => r.value),
        capacity: capacity.value
    })
}, { deep: true })
</script>

<template>
    <div class="w-full max-w-5xl mx-auto px-4 py-8">
        <div class="bg-white rounded-[24px] border border-black/10 shadow-sm p-8 hover:shadow-md">
            <!-- Title & Subtitle -->
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Reserva de Laboratório</h1>
                <p class="text-neutral-500 text-base mt-2">Pesquise e filtre os espaços disponíveis.</p>
            </div>

            <!-- Filters Row -->
            <div class="flex flex-col md:flex-row gap-4 items-stretch">
                <!-- Search Input -->
                <div class="w-full">
                    <UInput v-model="query" icon="i-lucide-search" placeholder="Buscar por laboratório ou sala..."
                        id="spaces-query-form" size="xl" class="w-full" />
                </div>

                <!-- Resources Dropdown (Multi-select) -->
                <div class="w-full md:w-auto">
                    <USelectMenu v-model="selectedResources" :options="resources" :items="resources" multiple
                        placeholder="Recursos..." icon="i-lucide-filter" size="xl" value-attribute="value"
                        option-attribute="label" class="min-w-[200px] w-full md:max-w-[200px]"
                        :ui="{
                            base: 'rounded-full'
                            
                        }"
                        :search-input="{
                            ui: {
                                base: 'rounded-none shadow-black/7'
                            }
                        }" />
                </div>

                <!-- Capacity / Places Input -->
                <div class="w-full md:w-auto">
                    <UInput v-model="capacity" icon="i-lucide-users" placeholder="Lotação..." type="number" size="xl"
                        variant="outline" class="w-full" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
