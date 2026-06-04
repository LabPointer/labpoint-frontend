<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui';
import { useDebounceFn, type onStartTyping } from '@vueuse/core';
import type { SpaceQuery } from '~~/shared/types';

const props = defineProps<{ resources: Map<number, string> }>()

const emit = defineEmits<{
    (e: 'onQuery', filters: SpaceQuery): void
}>()

//const resourceItems = ref<string[]>(props.resources.values().toArray())

const query = ref('')
const capacity = ref<number>(0)
const resourceValues = ref<string[]>([])


// Watch for variable changes and emit callback
watch([query, resourceValues, capacity], () => {
    const keys = resourceValues.value.map(valor => {
        return [...props.resources.entries()].find(([k, v]) => v === valor)?.[0] as number;
    })
    emit('onQuery', {
        query: query.value,
        resources: keys,
        capacity: capacity.value
    })
}, { deep: true })
</script>

<template>
    <section class="w-full max-w-5xl mx-auto">
        <div
            class="bg-neutral-100/70 dark:bg-neutral-900/50 rounded-md border border-black/10 dark:border-white/15 shadow-sm dark:shadow-white/10 p-6 hover:shadow-md">
            <!-- Title & Subtitle -->
            <div class="mb-4">
                <h1 class="text-lg font-bold tracking-tight">Reserva de Laboratório</h1>
                <p class="text-neutral-500 dark:text-neutral-400 text-sm mt-2">Pesquise e filtre os espaços disponíveis.
                </p>
            </div>

            <!-- Filters Row -->
            <div class="flex flex-col md:flex-row gap-2 items-stretch">
                <!-- Search Input -->
                <div class="w-full">
                    <UInput v-model="query" icon="i-lucide-search" placeholder="Buscar por laboratório ou sala..."
                        id="spaces-query-form" size="md" class="w-full" />
                </div>

                <!-- Resources Dropdown (Multi-select) -->
                <div class="w-full md:w-auto">
                    <USelectMenu v-model="resourceValues" :items="props.resources.values().toArray()" multiple
                        placeholder="Recursos..." icon="i-lucide-filter" size="md"
                        option-attribute="label" class="min-w-50 w-full md:max-w-50" :ui="{
                            base: 'rounded-md'
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
    </section>
</template>

<style scoped></style>
