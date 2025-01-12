
<script setup>

import {useRouter, useRuntimeConfig} from '#imports';
import axios from 'axios';
import {ref} from 'vue'

definePageMeta({
  middleware: ['auth'],
});

const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBase;


const email = ref('');
const password = ref('');
const showRegisterPopup = ref(false);
const registerEmail = ref('');
const registerName = ref('');
const registerPassword = ref('');
const repeatPassword = ref('');
const router = useRouter()

const handleSubmit = async () => {
  try {
    const response = await axios.post(apiBaseUrl +'/auth/login', {
      email: email.value,
      password: password.value,
      withCredentials: true
    });
    console.log("Login successful", response.data);
    router.push('/');
  } catch (error) {
    console.error('Login failed:', error);
    alert("Login failed. Check your credentials.");
  }
};

const handleRegister = async () => {
  if (registerPassword.value !== repeatPassword.value) {
    alert("Passwords do not match");
    return;
  }
  try {
    const response = await axios.post(apiBaseUrl +'/auth/register', {
      name: registerName.value,
      email: registerEmail.value,
      password: registerPassword.value,
      withCredentials: true
    });
    console.log('Registration successful:', response.data);
    alert("Registration successful");
    showRegisterPopup.value = false;
    registerPassword.value = "";
    registerEmail.value = "";
    registerName.value = "";
    repeatPassword.value = "";
  } catch (error) {
    console.error('Registration failed:', error);
    alert("Registration failed. Email might be already in use.");
  }
};

const signInWithSSO = () => {
  const authUrl = `${apiBaseUrl}/auth/github`;
  window.open(authUrl, '_blank');
};
</script>

<template>
  <div class="flex items-center justify-center bg-dark-blue text-white">
    <div class="bg-form-bg p-8 rounded-xl shadow-2xl w-full max-w-md">
      <h1 class="text-3xl font-extrabold text-center mb-8">Sign in</h1>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300">Email</label>
          <input
              id="email"
              v-model="email"
              type="email"
              class="mt-2 block w-full px-4 py-2 bg-input-bg text-white rounded-lg border border-gray-600 placeholder-placeholder focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
              required
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
          <input
              id="password"
              v-model="password"
              type="password"
              class="mt-2 block w-full px-4 py-2 bg-input-bg text-white rounded-lg border border-gray-600 placeholder-placeholder focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your password"
              required
          />
        </div>
        <button
            type="submit"
            class="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Login
        </button>
      </form>
      <div class="mt-6">
        <button
            @click="signInWithSSO"
            class="w-full py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition duration-300 flex items-center justify-center"
        >
          <span class="material-icons-outlined mr-2">lock</span>
          Sign in with SSO
        </button>
      </div>
      <div class="mt-4 text-center">
        <button @click="showRegisterPopup = true" class="text-blue-500 hover:text-blue-400">Register</button>
      </div>
    </div>

    <div v-if="showRegisterPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-form-bg p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 class="text-2xl font-bold text-center mb-4">Register</h2>
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label for="registerEmail" class="block text-sm font-medium text-gray-300">Email</label>
            <input
                id="registerEmail"
                v-model="registerEmail"
                type="email"
                class="mt-2 block w-full px-4 py-2 bg-input-bg text-white rounded-lg border border-gray-600 placeholder-placeholder focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your email"
                required
            />
          </div>
          <div>
            <label for="registerName" class="block text-sm font-medium text-gray-300">Name</label>
            <input
                id="registerName"
                v-model="registerName"
                type="text"
                class="mt-2 block w-full px-4 py-2 bg-input-bg text-white rounded-lg border border-gray-600 placeholder-placeholder focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your name"
                required
            />
          </div>
          <div>
            <label for="registerPassword" class="block text-sm font-medium text-gray-300">Password</label>
            <input
                id="registerPassword"
                v-model="registerPassword"
                type="password"
                class="mt-2 block w-full px-4 py-2 bg-input-bg text-white rounded-lg border border-gray-600 placeholder-placeholder focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your password"
                required
            />
          </div>
          <div>
            <label for="repeatPassword" class="block text-sm font-medium text-gray-300">Repeat Password</label>
            <input
                id="repeatPassword"
                v-model="repeatPassword"
                type="password"
                class="mt-2 block w-full px-4 py-2 bg-input-bg text-white rounded-lg border border-gray-600 placeholder-placeholder focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Repeat your password"
                required
            />
          </div>
          <button
              type="submit"
              class="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Register
          </button>
          <button @click="showRegisterPopup = false" type="button" class="w-full py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition duration-300">Close</button>
        </form>
      </div>
    </div>
  </div>
</template>
