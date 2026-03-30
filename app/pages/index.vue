<script setup lang="ts">
import type { Space } from '~/types/api';
import type { SpaceQuery } from '~/types/spaces';
import { useDebounceFn } from '@vueuse/core';
import SpaceReservePopup from '~/components/SpaceReservePopup.vue';

const showPopup = ref<boolean>(false);

const filters = ref<SpaceQuery>({
    query: '',
    resources: [],
    capacity: 0
});

const spacePopupProps = ref<{
    spaceName: string
    capacity: number
    resources: string[]
}>({ spaceName: '', capacity: 0, resources: [] });

// Computa os parâmetros para envio para a API, limpando valores vazios
const queryParams = computed(() => {
    return {
        name: filters.value.query || undefined,
        capacity: filters.value.capacity > 0 ? filters.value.capacity : undefined,
        resources: filters.value.resources.length > 0 ? filters.value.resources.join(',') : undefined
    }
})

// Faz a requisição para a API local com suporte a extração do body.data
const { data: spaces, status, error } = await useFetch<Space[]>('http://localhost:3001/spaces', {
    query: queryParams,
    lazy: true,
    transform: (response: any) => {
        if (response.status === "error") {
            throw new Error(response.message || 'Erro na API');
        }
        return response.data as Space[];
    }
});

const handleFilterChange = useDebounceFn((newFilters: SpaceQuery) => {
    filters.value = newFilters;
}, 200);

const onReserveOpenPopup = (spaceName: string, capacity: number, resources: string[]) => {
    spacePopupProps.value = { spaceName, capacity, resources };
    showPopup.value = true;
}

const onReserveClosePopup = () => {
    showPopup.value = false;
    spacePopupProps.value = { spaceName: '', capacity: 0, resources: [] };
}
</script>

<template>
  <div v-show="showPopup" class="fixed top-0 left-0 w-full h-[calc(100vh-65px)] mt-[65px] pt-[24px] bg-black/20 z-40 backdrop-blur-sm flex justify-center">
    <SpaceReservePopup :spaceName="spacePopupProps.spaceName" :capacity="spacePopupProps.capacity" :resources="spacePopupProps.resources" @onClose="onReserveClosePopup"/>
  </div>
  
  <div class="flex flex-col gap-y-6 my-4 w-full">
    <!-- Barra de Pesquisa -->
    <SpaceSearchBar @onQuery="handleFilterChange" />

    <div class="max-w-5xl mx-auto w-full px-4 flex flex-col gap-6">
      
      <!-- Cabeçalho (Título e Label de Resultados) -->
      <div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 class="text-xl font-bold text-neutral-900 tracking-tight">Laboratórios & Salas de Aula Disponíveis</h2>
          <p class="text-[13px] text-neutral-500 mt-1">Navegue pelos espaços que correspondem aos seus critérios de pesquisa.</p>
        </div>
        
        <div class="text-[13px] font-semibold text-neutral-500 shrink-0">
          <span v-if="status === 'pending' && spaces && spaces.length > 0">Carregando...</span>
          <span v-else-if="spaces">{{ spaces.length }} resultado{{ spaces.length !== 1 ? 's' : '' }} encontrado{{ spaces.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Caixa Vermelha de Erro -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-5 rounded-[16px] flex items-start gap-4 shadow-sm">
        <Icon name="i-lucide-alert-circle" class="w-6 h-6 mt-0.5 shrink-0" />
        <div>
          <h4 class="font-bold text-base">Erro ao conectar com a API</h4>
          <p class="text-[13px] mt-1 opacity-90">Não foi possível buscar as informações. Certifique-se de que a API está rodando no localhost e de que a URL está correta. (Detalhe: {{ error.message }})</p>
        </div>
      </div>

      <!-- Círculo girando quando não há dados ainda e tela carregando -->
      <div v-else-if="status === 'pending' && !spaces" class="flex flex-col items-center justify-center py-24 gap-4">
        <Icon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-indigo-600" />
        <p class="text-sm text-neutral-500 font-medium">Buscando laboratórios...</p>
      </div>

      <!-- Caixa Branca quando não há dados (Empty State) -->
      <div v-else-if="spaces && spaces.length === 0" class="bg-white border border-black/10 rounded-[24px] p-16 text-center shadow-sm">
        <div class="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-100">
          <Icon name="i-lucide-search-x" class="w-8 h-8 text-neutral-400" />
        </div>
        <h3 class="text-[1.15rem] font-bold text-neutral-900">Nenhum dado encontrado</h3>
        <p class="text-[13px] text-neutral-500 mt-2 max-w-sm mx-auto">Não encontramos nenhum laboratório ou sala com esses filtros. Tente reduzir as restrições de sua busca em recursos ou lotação.</p>
      </div>

      <!-- Grid de Componentes (Quando existe sucesso na busca e dados retornados) -->
      <div v-else-if="spaces && spaces.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SpaceCard 
          v-for="space in spaces"
          :key="space.name"
          :title="space.name"
          :capacity="Number(space.capacity)"
          :resources="space.resources",
          @onReserve="onReserveOpenPopup"
        />
      </div>

    </div>
  </div>
</template>