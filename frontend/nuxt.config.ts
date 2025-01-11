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
  router: {
    middleware: ['auth'],
  },
  auth: {
    strategies: {
      local: {
        token: {
          property: 'token', // Adjust based on your API's response
          global: true,
          required: true,
          type: 'Bearer',
        },
        user: {
          property: 'user', // Adjust based on your API's response
          // Set to `false` if the API does not return user details
        },
        endpoints: {
          login: { url: '/auth/login', method: 'post' },
          logout: { url: '/auth/logout', method: 'post' },
          user: { url: '/auth/user', method: 'get' },
        },
      },
      google: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID',
        codeChallengeMethod: '',
        responseType: 'token id_token',
        redirectUri: 'http://localhost:3000/auth/callback', // Adjust for production
      },
      github: {
        clientId: 'YOUR_GITHUB_CLIENT_ID',
        clientSecret: 'YOUR_GITHUB_CLIENT_SECRET', // Only required for server-side flow
        scope: ['read:user', 'user:email'],
        redirectUri: 'http://localhost:3000/auth/callback', // Adjust for production
      },
    },
    redirect: {
      login: '/', // Redirect to login page if not authenticated
      logout: '/', // Redirect here after logout
      callback: '/auth/callback', // OAuth2 callback URL
      home: '/chat', // Redirect here after login
    },
  },

})