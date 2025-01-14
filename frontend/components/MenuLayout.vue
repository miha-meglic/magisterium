<template>
  <div>
    <header class="text-white p-0 flex items-center justify-between absolute left-0 top-3 z-50 w-full">
      <div class="flex px-4 items-center">
        <button @click="toggleMenu" class="p-2 bg-blue-500 rounded-lg hover:bg-blue-700 transition">
          <span class="material-icons-outlined">menu</span>
        </button>
        <h1 class="text-xl font-bold ml-2">Menu</h1>
      </div>

      <div class="relative right-2"> <button @click="toggleUserMenu" class="px-4 flex items-center cursor-pointer self-end text-right">
        <span class="material-icons-outlined " :class="{ 'rotate-90': isUserMenuOpen }">
            arrow_right
          </span><span class="mr-2">{{ user.name }}</span>
      </button>
        <div v-if="isUserMenuOpen" class="absolute right-0 px-1 mt-2 bg-gray-800 text-white rounded-md shadow-lg w-48 z-50">
          <ul class="py-1">
            <li v-for="tenant in tenants" :key="tenant.id"
              :class="{ 'px-4 py-2 bg-blue-600 hover:bg-blue-700': tenant.id === selectedTenant?.id, 'px-0 py-2 hover:bg-gray-700 cursor-pointer': tenant.id !== selectedTenant?.id }"
              @click="switchTenant(tenant.id)">
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

<script setup lang="ts">

import {useRouter, useCookie, useRuntimeConfig} from '#imports';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import type { User, Tenant } from '~/types.vue';

const menuItems = ref([
  { path: '/', label: 'Home' },
  { path: '/chat', label: 'Chat' },
  { path: '/class', label: 'Classroom' },
]);

const isMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const user = ref<User>({ id: 'null', name: 'Name' });
const tenants = ref<Tenant[]>([]);
const selectedTenant = ref<Tenant>({ id: 'Null', name: 'Name' });
const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBase;


const fetchUserData = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/user`, {
      withCredentials: true});
    user.value = response.data;
    const userCookie = useCookie('selectedUser');
    if (user) {
      if(userCookie.value != user.value.id)
      {
        userCookie.value = user.value.id;
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const fetchUserTenants = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/user/tenants`, {
      withCredentials: true});
    tenants.value = response.data;
  } catch (error) {
    console.error('Error fetching user tenants:', error);
  }
};

const switchTenant = (tenantId: string) => {
  const  tenantCookie = useCookie('selectedTenant');
  const tenant = tenants.value.find(t => t.id === tenantId);
  if (tenant) {
    selectedTenant.value = { id: tenant.id, name: tenant.name };
    if(tenantCookie.value != tenant.id)
    {
      tenantCookie.value = selectedTenant.value.id;
      window.location.reload();
    }
  } else {
    console.error("Tenant not found!");
  }
};

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


const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const logout = async () => {
  try {
    const response = await axios.get(apiBaseUrl + '/auth/logout',{
      withCredentials: true});
    if (response.data) {
      console.log(response.data.message || "Logout failed: Unknown error");

      const userCookie = useCookie('selectedUser');
      const tenantCookie = useCookie('selectedTenant');
      userCookie.value = null;
      tenantCookie.value = null;
      window.location.reload();
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

onMounted(async () => {
  await fetchUserData();
  await fetchUserTenants();
  const tenantCookie = useCookie('selectedTenant');
  if (tenantCookie.value) {
    switchTenant(tenantCookie.value);
  }
  else if (tenants.value.length > 0) { // Set cookie to first tenant if none exists
    switchTenant(tenants.value[0].id); //Call switch tenant to handle logic
  }
});
</script>
