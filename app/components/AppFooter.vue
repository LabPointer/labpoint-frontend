<script lang="ts" setup>
const date = new Date()
const year = date.getFullYear()
</script>

<template>
    <UFooter>
        <template #left>
            <div class="flex items-center gap-2">
                <Icon name="i-lucide-map-pin" class="h-6 w-6 text-indigo-600" />
                <span class="text-xl font-bold tracking-tight text-indigo-600">Labpoint</span>
            </div>
        </template>

        <p class="text-sm">Copyright © {{ new Date().getFullYear() }}.</p>

        <template #right>
            <UButton icon="i-simple-icons-github" color="neutral" variant="ghost" to="https://github.com/nuxt/nuxt"
                target="_blank" aria-label="GitHub" />
        </template>
    </UFooter>
</template>