// nuxt.config.ts
// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/src/output.css'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined',
        },
      ],
    },
  },
  // Add runtimeConfig for the API base URL
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL_USER || 'http://localhost:3000/api',
      apiBaseMessaging: process.env.API_BASE_URL_MESSAGING || 'http://localhost:3001/api',
      apiBaseClassroom: process.env.API_BASE_URL_CLASSROOM || 'http://localhost:3002/api',
      apiBaseSchedule: process.env.API_BASE_URL_SCHEDULE || 'http://localhost:3003/api',
    },
  },
});