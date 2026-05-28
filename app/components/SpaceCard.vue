<script setup lang="ts">
import type { SpaceInfo } from '#shared/types/spaces'

const emit = defineEmits<{
  (e: 'onReserve', spaceInfo: SpaceInfo): void
}>()

const props = defineProps<SpaceInfo>()

</script>

<template>
  <UCard class="w-full max-w-2xs bg-white/50 dark:bg-black/50 dark:backdrop-brightness-150 rounded-md shadow-md border border-black/10 dark:border-white/10">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 rounded-[8px] bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <Icon name="uil:desktop" size="16" />
        </div>
        <div>
          <p class="text-[10px] font-bold text-neutral-500 tracking-wider uppercase mb-0.5">Laboratório</p>
          <h3 class="text-[14px] font-bold text-neutral-800 dark:text-neutral-200 leading-tight">{{ props.name.charAt(0).toUpperCase() + props.name.slice(1) }}</h3>
        </div>
      </div>
    </template>

    <div class="space-y-2">
      <!-- Capacity box -->
      <div class="border border-neutral-300 dark:border-neutral-700 shadow-sm rounded-sm px-3 py-2 flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900/30">
        <div class="w-8 h-8 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-500 shrink-0">
          <Icon name="i-lucide-users" size="16" />
        </div>
        <div>
          <p class="text-[9px] font-bold text-neutral-500 tracking-wider uppercase mb-0.5">Capacidade</p>
          <p class="text-[12px] font-bold text-neutral-800 dark:text-neutral-200">{{ capacity }} lugares</p>
        </div>
      </div>

      <!-- Resources box -->
      <div class="border border-neutral-300 dark:border-neutral-700 shadow-sm rounded-sm py-2 px-4 bg-neutral-100 dark:bg-neutral-900/30">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="i-lucide-box" class="text-neutral-500" size="16" />
          <p class="text-[9px] font-bold text-neutral-500 tracking-wider uppercase">Recursos Incluídos</p>
        </div>
        <div v-if="resources && resources.length > 0" class="flex flex-wrap gap-2">
          <UBadge
            v-for="res in resources"
            :key="res"
            variant="solid"
            class="px-2.5 py-1 text-[11px] font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm"
          >
            {{ res }}
          </UBadge>
        </div>
        <div v-else class="text-[11px] text-neutral-400 font-medium">
          Nenhum recurso incluído.
        </div>
      </div>
    </div>

    <template #footer>
      <div>
        <UButton
          block
          size="md"
          color="primary"
          variant="subtle"
          class="rounded-md font-bold shadow-sm"
          :ui="{ base: 'rounded-md cursor-pointer' }"
          @click="emit('onReserve', props)"
        >
          Reservar Agora
        </UButton>
      </div>
    </template>
  </UCard>
</template>