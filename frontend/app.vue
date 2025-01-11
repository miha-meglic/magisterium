<template>
  <div class="flex flex-col min-h-screen bg-dark-blue text-white">
    <!-- Header -->
    <header class="bg-indigo-600 text-white p-4">
      <h1 class="text-center text-4xl font-bold">Magisterium</h1>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow flex items-center justify-center">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white p-4">
      <p class="text-center text-sm">© 2024 Magisterium. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  // Global logic if needed
};
</script>


<style>
/* Optional global styles */
body {
  font-family: Arial, sans-serif;
}
</style>