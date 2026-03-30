<script setup lang="ts">
import type { SpaceCardProps } from '~/types/spaces';

withDefaults(defineProps<SpaceCardProps>(), {
  type: 'LABORATÓRIO',
  icon: 'i-lucide-test-tube'
})
</script>

<template>
  <UCard class="rounded-2xl shadow-md border border-black/10">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-[14px] bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
          <Icon :name="icon" class="w-5.5 h-5.5" />
        </div>
        <div>
          <p class="text-[10px] font-bold text-neutral-500 tracking-wider uppercase mb-0.5">{{ type }}</p>
          <h3 class="text-[1.1rem] font-bold text-neutral-900 leading-tight">{{ title }}</h3>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Capacity box -->
      <div class="border border-neutral-300 shadow-sm rounded-[14px] p-3 flex items-center gap-3 bg-neutral-100">
        <div class="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-500 shrink-0">
          <Icon name="i-lucide-users" class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[9px] font-bold text-neutral-500 tracking-wider uppercase mb-0.5">Capacidade</p>
          <p class="text-[13px] font-bold text-neutral-800">{{ capacity }} lugares</p>
        </div>
      </div>

      <!-- Resources box -->
      <div class="border border-neutral-300 shadow-sm rounded-[14px] p-4 bg-neutral-100">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="i-lucide-box" class="w-4 h-4 text-neutral-500" />
          <p class="text-[9px] font-bold text-neutral-500 tracking-wider uppercase">Recursos Incluídos</p>
        </div>
        <div v-if="resources && resources.length > 0" class="flex flex-wrap gap-2">
          <UBadge
            v-for="res in resources"
            :key="res"
            variant="solid"
            class="px-2.5 py-1 text-[11px] font-medium text-neutral-600 bg-neutral-50 ring-1 ring-neutral-200 shadow-sm"
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
          variant="solid"
          class="rounded-full font-bold h-11 shadow-sm text-[14px]"
          :ui="{ base: 'rounded-full cursor-pointer bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-600' }"
        >
          Reservar Agora
        </UButton>
      </div>
    </template>
  </UCard>
</template>