<script setup lang="ts">
import type { SpaceInfo, SpaceQuery } from '~~/shared/types';
import { useDebounceFn } from '@vueuse/core';
import { useAsyncData } from 'nuxt/app';
import { ref, computed } from 'vue';

const showPopup = ref<boolean>(false);

const filters = ref<SpaceQuery>({
  query: '',
  resources: [],
  capacity: 0
});

const toast = useToast();

const spacePopupProps = ref<SpaceInfo>({ id: 0, name: '', capacity: 0, resources: [] });

const queryParams = computed(() => {
  return {
    name: filters.value.query || undefined,
    capacity: filters.value.capacity > 0 ? filters.value.capacity : undefined,
    resources: filters.value.resources.length > 0 ? filters.value.resources : undefined
  }
})

const { data: spaces, status, pending, error, refresh } = useAsyncData("spaces", async () => {
  const api = useApi();
  const { data, error, response } = await api.GET("/spaces", {
    params: {
      query: {
        name: queryParams.value.name,
        capacity: queryParams.value.capacity,
        resources: queryParams.value.resources,
        subjects: undefined,
        offset: 0,
        limit: 10
      }
    }
  });

  return { data, error };
}, {
  watch: [queryParams],
  immediate: true,
  server: false,
})

const handleFilterChange = useDebounceFn((newFilters: SpaceQuery) => {
  filters.value = newFilters;
  refresh();
}, 200);

const getSpacesCount = computed(() => spaces.value?.data?.spaces?.length || 0);

const hasSpaces = computed(() => getSpacesCount.value > 0);

const getSpaces = computed(() => spaces.value?.data?.spaces || []);

const onReserveOpenPopup = (spaceInfo: SpaceInfo) => {
  spacePopupProps.value = { id: spaceInfo.id, name: spaceInfo.name, capacity: spaceInfo.capacity, resources: spaceInfo.resources };
  showPopup.value = true;
}

const onReserveClosePopup = () => {
  showPopup.value = false;
  spacePopupProps.value = { id: 0, name: '', capacity: 0, resources: [] };
}
</script>

<template>
  <SpaceReserveModal v-model:open="showPopup" :id="spacePopupProps.id" :name="spacePopupProps.name"
    :capacity="spacePopupProps.capacity" :resources="spacePopupProps.resources" @onClose="onReserveClosePopup" />

  <UMain class="min-h-[calc(100vh-161px)] flex flex-col gap-y-6 my-4 mb-8 w-full px-4">
    <!-- Barra de Pesquisa -->
    <SpaceSearchBar @onQuery="handleFilterChange" />

    <section class="max-w-5xl mx-auto w-full px-4 flex flex-col gap-6">

      <!-- Cabeçalho (Título e Label de Resultados) -->
      <div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Laboratórios & Salas de
            Aula Disponíveis</h2>
          <p class="text-[13px] text-neutral-500 mt-1">Navegue pelos espaços que correspondem aos seus critérios de
            pesquisa.</p>
        </div>

        <div class="text-[13px] font-semibold text-neutral-500 shrink-0">
          <span v-if="status === 'pending'">Carregando...</span>
          <span v-else-if="spaces">{{ getSpacesCount }} {{ getSpacesCount === 1 ? 'resultado encontrado' : 'resultados encontrados' }}</span>
        </div>
      </div>

      <!-- Caixa Vermelha de Erro -->
      <div v-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-300 p-5 rounded-md flex items-start gap-4 shadow-sm">
        <Icon name="i-lucide-alert-circle" class="w-6 h-6 mt-0.5 shrink-0" />
        <div>
          <h4 class="font-bold text-base">Erro ao conectar com a API</h4>
          <p class="text-[13px] mt-1 opacity-90">Não foi possível buscar as informações. Certifique-se de que a API está
            rodando no localhost e de que a URL está correta. (Detalhe: {{ error.message }})</p>
        </div>
      </div>

      <!-- Círculo girando quando não há dados ainda e tela carregando -->
      <div v-else-if="pending" class="flex flex-col items-center justify-center py-24 gap-4">
        <Icon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p class="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Buscando laboratórios...</p>
      </div>

      <!-- Caixa Branca quando não há dados (Empty State) -->
      <div v-else-if="!hasSpaces"
        class="bg-white dark:bg-neutral-900/70 border border-black/10 dark:border-white/10 rounded-md p-16 text-center shadow-sm">
        <div
          class="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-100 dark:border-neutral-700">
          <Icon name="i-lucide-search-x" class="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
        </div>
        <h3 class="text-[1.15rem] font-bold text-neutral-900 dark:text-neutral-100">Nenhum dado encontrado</h3>
        <p class="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm mx-auto">Não encontramos nenhum
          laboratório ou sala com
          esses
          filtros. Tente reduzir as restrições de sua busca em recursos ou lotação.</p>
      </div>

      <!-- Grid de Componentes (Quando existe sucesso na busca e dados retornados) -->
      <div v-else-if="hasSpaces"
        class="w-full justify-items-center items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <SpaceCard v-for="space in getSpaces" :key="space.id" :id="space.id" :name="space.name as string"
          :capacity="space.capacity" :resources="space.resources || []" @onReserve="onReserveOpenPopup" />
      </div>

    </section>
  </UMain>
</template>