<template>
  <div class="flex items-center justify-center bg-dark-blue text-white">
    <div class="bg-form-bg p-8 rounded-xl shadow-2xl w-full max-w-md">
      <h1 class="text-3xl font-extrabold text-center mb-8">Sign in</h1>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Username Field -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300">Username</label>
          <input
              id="username"
              v-model="username"
              type="text"
              class="mt-2 block w-full px-4 py-2 bg-input-bg text-white rounded-lg border border-gray-600 placeholder-placeholder focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your username"
              required
          />
        </div>
        <!-- Password Field -->
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
        <!-- Submit Button -->
        <button
            type="submit"
            class="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Login
        </button>
      </form>
      <!-- Sign in with SSO Button -->
      <div class="mt-6">
        <button
            @click="signInWithSSO"
            class="w-full py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition duration-300 flex items-center justify-center"
        >
          <span class="material-icons-outlined mr-2">lock</span> <!-- Optional Icon -->
          Sign in with SSO
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async handleSubmit() {
      try {
        await this.$auth.loginWith('local', {
          data: {
            username: this.username,
            password: this.password,
          },
        });
        this.$router.push('/chat'); // Redirect after login
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
  },
};
</script>

