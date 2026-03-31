<template>
    <footer class="bg-white border-t border-neutral-100">
        <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <!-- Logo & Brand -->
                <div class="flex items-center gap-2">
                    <Icon name="i-lucide-map-pin" class="h-6 w-6 text-indigo-600" />
                    <span class="text-xl font-bold tracking-tight text-indigo-600">LabPoint</span>
                </div>

                <!-- Copyright -->
                <div class="text-center md:text-left">
                    <p class="text-sm text-neutral-500">
                        © {{ new Date().getFullYear() }} LabPoint. Todos os direitos reservados.
                    </p>
                </div>

                <!-- Social Links (Optional) -->
                <div class="flex items-center gap-4">
                    <a href="#" class="text-neutral-400 hover:text-indigo-600 transition-colors">
                        <Icon name="i-lucide-instagram" class="h-5 w-5" />
                    </a>
                    <a href="#" class="text-neutral-400 hover:text-indigo-600 transition-colors">
                        <Icon name="i-lucide-facebook" class="h-5 w-5" />
                    </a>
                    <a href="#" class="text-neutral-400 hover:text-indigo-600 transition-colors">
                        <Icon name="i-lucide-twitter" class="h-5 w-5" />
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>