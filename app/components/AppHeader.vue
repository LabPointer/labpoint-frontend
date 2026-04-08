<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

// Close menu on navigation
const route = useRoute();

const menuItems = computed<NavigationMenuItem[]>(() => [
    {
        label: 'Início',
        to: '/',
    },
    {
        label: 'Minhas Reservas',
        to: '/minhas-reservas',
        active: route.path.startsWith('/minhas-reservas')
    },
]);

const profileItems = ref<DropdownMenuItem[][]>([
    [
        { label: 'Perfil', icon: 'i-lucide-user', click: () => navigateTo('/profile') },
    ],
    [
        { label: 'Sair', icon: 'i-lucide-log-out', color: 'error', click: () => navigateTo('/login') },
    ]
]);
</script>

<template>
    <UHeader mode="slideover">
        <template #title>
            <NuxtLink to="/" class="flex items-center gap-2 transition-opacity hover:opacity-90">
                <Icon name="i-lucide-map-pin" class="h-6 w-6 text-indigo-600" />
                <span class="text-xl font-bold tracking-tight text-indigo-600">LabPoint</span>
            </NuxtLink>
        </template>

        <UNavigationMenu :items="menuItems" />

        <template #right>
            <!-- Notification Bell -->
            <UChip size="3xl">
                <UButton icon="i-lucide-bell" color="neutral" variant="soft" class="rounded-full" />
            </UChip>

            <!-- Login Button (Desktop) -->
            <UDropdownMenu :items="profileItems">
                <UButton icon="i-lucide-user" color="neutral" variant="soft" class="rounded-full" />
            </UDropdownMenu>
        </template>

        <template #body>
            <UNavigationMenu :items="menuItems" orientation="vertical" class="-mx-2.5" />
        </template>
    </UHeader>
</template>

<style scoped>
* {
    transition: all 200ms ease-out;
}
</style>