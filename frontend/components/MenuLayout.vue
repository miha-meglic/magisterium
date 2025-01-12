<template>
  <div>
    <header class="text-white p-0 flex items-center justify-between absolute left-3 top-3 z-50 w-full">
      <div class="flex items-center">
        <button @click="toggleMenu" class="p-2 bg-blue-500 rounded-lg hover:bg-blue-700 transition">
          <span class="material-icons-outlined">menu</span>
        </button>
        <h1 class="text-xl font-bold ml-2">Menu</h1>
      </div>

      <div class="relative"> <button @click="toggleUserMenu" class="px-6 flex items-center cursor-pointer self-end text-right">
        <span class="material-icons-outlined " :class="{ 'rotate-90': isUserMenuOpen }">
            arrow_right
          </span><span class="mr-2">{{ userName }}</span>
      </button>
        <div v-if="isUserMenuOpen" class="absolute right-0 mt-2 bg-gray-800 text-white rounded-md shadow-lg w-48 z-50">
          <ul class="py-1">
            <li v-for="tenant in userTenants" :key="tenant.id" class="px-4 py-2 hover:bg-gray-700 cursor-pointer">
              {{ tenant.name }}
            </li>

            <li class="border-t border-gray-700">
              <button @click="logout" class="block px-4 py-2 hover:bg-gray-700 text-red-500 w-full text-left">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <div class="fixed top-0 left-0 h-screen z-40" :class="{ 'w-64': isMenuOpen, 'w-0': !isMenuOpen, 'transition-all duration-300 ease-in-out':true}">
      <div v-if="isMenuOpen" class="bg-gray-800 text-white shadow-lg p-4 h-full">
        <nav class="space-y-4 pt-16">
          <NuxtLink to="/" class="block py-2 px-4 hover:bg-blue-500 rounded-lg">Home</NuxtLink>
          <NuxtLink to="/chat" class="block py-2 px-4 hover:bg-blue-500 rounded-lg">Chat</NuxtLink>
          <NuxtLink to="/class" class="block py-2 px-4 hover:bg-blue-500 rounded-lg">Classroom</NuxtLink>
        </nav>
      </div>
    </div>
    <div :class="{'ml-64': isMenuOpen, 'transition-all duration-300 ease-in-out':true}">
      <slot />
    </div>
  </div>
</template>

<script setup>

import {useRouter, useRuntimeConfig} from '#imports';
import { ref } from 'vue';
import axios from 'axios';

const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBase;

const props = defineProps({
  title: {
    type: String,
    default: 'App',
  },
  userName: {
    type: String,
    default: 'User',
  },
  userTenants: {
    type: Array,
    default: () => [],
  },
});

const isMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const router = useRouter();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const logout = async () => {
  try {
    const response = await axios.post(apiBaseUrl + '/auth/logout');
    if (response.data.success) {
      router.push('/login');
    } else {
      console.error("Logout failed:", response.data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Logout failed:", error);
    // Handle error, e.g., display an error message to the user
  }
};
</script>
