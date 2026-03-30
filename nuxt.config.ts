// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css',
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  colorMode: {
    preference: 'light',
    storageKey: 'custom-key-color-mode'
  },
  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/ui', 'nuxt-toast'],
})