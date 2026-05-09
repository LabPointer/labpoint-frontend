<script lang="ts" setup>
const date = new Date()
const currentYear = date.getFullYear()

const footerLinks = [
    {
        label: "GitHub",
        href: "https://github.com/BangbooBot",
        icon: "i-simple-icons-github"
    },
]
</script>

<template>
    <UFooter class="border-t border-black/10 dark:border-white/50">
        <nav class="container max-w-5xl mx-auto flex flex-col gap-y-2 items-center">
            <div class="flex flex-row gap-2 items-center">
                <p class="text-center text-black dark:text-white">© {{ currentYear }} LabPoint. Todos os direitos reservados.</p>
            </div>
            <div class="flex flex-row gap-3 items-center">
                <template v-for="link in footerLinks" :key="link.href">
                    <a :href="link.href" target="_blank" rel="noopener noreferrer">
                        <UButton :icon="link.icon" color="neutral" variant="ghost" size="md" aria-label="GitHub" />
                    </a>
                </template>
            </div>
        </nav>
    </UFooter>
</template>