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
    preference: 'dark',
    fallback: 'light',
    storageKey: 'custom-key-color-mode',
    classSuffix: ''
  },
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/ui',
    'nuxt-toast',
    'nuxt-typed-router',
    '@nuxtjs/color-mode',
  ],
  experimental: {
    typedPages: true
  },
  hooks: {
    'pages:extend'(pages) {
      pages.forEach((page) => {
        if (page.file?.includes('(private)')) {
          page.meta ||= {}
          page.meta.layout = 'private'
        } else if (page.file?.includes('(public)')) {
          page.meta ||= {}
          page.meta.layout = 'public'
        }
      })
    }
  },
})