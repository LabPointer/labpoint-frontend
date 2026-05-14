<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

// Close menu on navigation
const route = useRoute();

const menuItems = computed<NavigationMenuItem[]>(() => [
    {
        label: 'Início',
        to: '/home',
        active: route.path.startsWith('/home')
    },
    {
        label: 'Calendário',
        to: '/calendar',
        active: route.path.startsWith('/calendar')
    },
    {
        label: 'Historico',
        to: '/history',
        active: route.path.startsWith('/history')
    }
]);

const colorMode = useColorMode()

const profileItems = ref<DropdownMenuItem[][]>([
    [
        { label: 'Perfil', icon: 'i-lucide-user', click: () => navigateTo('/profile') },
        {
            label: 'Tema',
            icon: computed(() => colorMode.preference !== 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'),
            children: [
                {
                    label: 'Light',
                    icon: 'i-lucide-sun',
                    onSelect: () => {
                        colorMode.preference = 'light'
                    }
                },
                {
                    label: 'Dark',
                    icon: 'i-lucide-moon',
                    onSelect: () => {
                        colorMode.preference = 'dark'
                    }
                }
            ]
        }
    ],
    [
        { label: 'Sair', icon: 'i-lucide-log-out', color: 'error', onSelect: async () => {
            await fetch("/api/logout", {
                method: 'POST'
            }).finally(() => {
                navigateTo('/')
            })
        } },
    ]
]);
</script>

<template>
    <UHeader mode="slideover" :ui="{
        root: 'border-b bg-white/10 dark:bg-black/50 backdrop-blur-lg dark:backdrop-brightness-150 border-black/10 dark:border-white/10 shadow-md dark:shadow-white/10',
    }">
        <template #title>
            <NuxtLink to="/" class="flex items-center gap-2 transition-opacity hover:opacity-90">
                <Icon name="i-lucide-map-pin" class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <span class="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">LabPoint</span>
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