<script setup lang="ts">
const isOpen = ref(false)

// Close menu on navigation
const closeMenu = () => {
    isOpen.value = false
}
</script>

<template>
    <header class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
        <div class="mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <!-- Logo -->
            <NuxtLink to="/" class="flex items-center gap-2 transition-opacity hover:opacity-90">
                <Icon name="i-lucide-map-pin" class="h-6 w-6 text-indigo-600" />
                <span class="text-xl font-bold tracking-tight text-indigo-600">LabPoint</span>
            </NuxtLink>

            <!-- Desktop Navigation -->
            <nav class="hidden md:flex flex-row items-center gap-1">
                <NuxtLink to="/"
                    class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-black/0 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 hover:border-black/5 hover:shadow-inner"
                    active-class="bg-neutral-100 text-neutral-900 border-black/5 shadow-inner">
                    <Icon name="i-lucide-home" class="h-5 w-5" />
                    <span>Início</span>
                </NuxtLink>
                <NuxtLink to="/minhas-reservas"
                    class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-black/0 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 hover:border-black/5 hover:shadow-inner"
                    active-class="bg-neutral-100 text-neutral-900 border-black/5 shadow-inner">
                    <Icon name="i-lucide-book-open" class="h-5 w-5" />
                    <span>Minhas Reservas</span>
                </NuxtLink>
            </nav>

            <!-- Action Buttons & Mobile Toggle -->
            <div class="flex items-center gap-2 sm:gap-4">
                <!-- Notification Bell -->
                <button
                    class="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 border border-black/0 hover:bg-neutral-100 hover:text-neutral-900 hover:border-black/10 hover:shadow-inner">
                    <Icon name="i-lucide-bell" class="h-6 w-6" />
                    <span
                        class="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        3
                    </span>
                </button>

                <!-- Login Button (Desktop) -->
                <NuxtLink to="/"
                    class="hidden md:flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]">
                    <Icon name="i-lucide-user" class="h-5 w-5" />
                    <span>Entrar</span>
                </NuxtLink>

                <!-- Mobile Menu Button -->
                <button @click="isOpen = !isOpen"
                    class="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 border border-black/0 hover:border-black/10"
                    aria-label="Toggle menu">
                    <Icon :name="isOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="h-6 w-6"
                        :class="{ 'rotate-90': isOpen }" />
                </button>
            </div>
        </div>

        <!-- Mobile Navigation Menu (Absolute) -->
        <div :class="[isOpen ? 'h-55 py-4' : 'h-0 py-0 pointer-events-none', 'absolute overflow-hidden transition-transform top-16 left-0 origin-top w-full border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 shadow-xl md:hidden -mt-px']">
            <nav class="flex flex-col gap-2">
                <NuxtLink to="/" @click="closeMenu"
                    class="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100"
                    active-class="bg-neutral-100 text-indigo-600 shadow-inner">
                    <Icon name="i-lucide-home" class="h-5 w-5" />
                    <span>Início</span>
                </NuxtLink>
                <NuxtLink to="/minhas-reservas" @click="closeMenu"
                    class="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100"
                    active-class="bg-neutral-100 text-indigo-600 shadow-inner">
                    <Icon name="i-lucide-book-open" class="h-5 w-5" />
                    <span>Minhas Reservas</span>
                </NuxtLink>
                <hr class="my-2 border-neutral-300" />
                <NuxtLink to="/" @click="closeMenu"
                    class="flex items-center gap-3 rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-sm">
                    <Icon name="i-lucide-user" class="h-5 w-5" />
                    <span>Entrar</span>
                </NuxtLink>
            </nav>
        </div>
    </header>
</template>

<style scoped>
* {
    transition: all 200ms ease-out;
}
</style>