<template>
  <div>
    <header class="text-white p-0 flex items-center justify-between absolute left-3 top-3 z-50"> <button @click="toggleMenu" class="p-2 bg-blue-500 rounded-lg hover:bg-blue-700 transition">
      <span class="material-icons-outlined">menu</span>
    </button>
      <h1 class="text-xl font-bold ml-2">Menu</h1>
    </header>

    <div class="fixed top-0 left-0 h-screen z-40" :class="{ 'w-64': isMenuOpen, 'w-0': !isMenuOpen, 'transition-all duration-300 ease-in-out':true}">
      <div v-if="isMenuOpen" class="bg-gray-800 text-white shadow-lg p-4 h-full">
        <button @click="toggleMenu" class="text-right w-full mb-6 text-xl">×</button>
        <nav class="space-y-4">
          <NuxtLink to="/chat" class="block py-2 px-4 hover:bg-blue-500 rounded-lg">Chat</NuxtLink>
          <NuxtLink to="/" class="block py-2 px-4 hover:bg-blue-500 rounded-lg">Home</NuxtLink>
          <NuxtLink to="/page2" class="block py-2 px-4 hover:bg-blue-500 rounded-lg">Page 2</NuxtLink>
          <NuxtLink to="/page3" class="block py-2 px-4 hover:bg-blue-500 rounded-lg">Page 3</NuxtLink>
        </nav>
      </div>
    </div>
    <div :class="{'ml-64': isMenuOpen, 'transition-all duration-300 ease-in-out':true}">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'App',
    },
  },
  data() {
    return {
      isMenuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
};
</script>
