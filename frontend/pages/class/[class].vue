<template>
  <MenuLayout title="Chat Room">
    <div class="bg-dark-blue min-h-screen text-white p-4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-center">Classroom Website</h1>
      </header>

      <div class="container mx-auto">
        <div v-if="!classData" class="bg-form-bg p-6 rounded-xl shadow-2xl">
          <h2 class="text-2xl font-bold mb-4">Available Classes</h2>
          <ul class="space-y-2">
            <li v-for="className in availableClasses" :key="className">
              <NuxtLink :to="`/class/${className}`"
                        class="block py-2 px-4 bg-input-bg rounded-lg hover:bg-gray-700 transition">
                {{ className }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div v-else class="center">
          <div class="flex space-x-4 mb-4">
            <button
                @click="showContent = true; showForum = false"
                :class="{
              'bg-blue-600 hover:bg-blue-700': showContent,
              'bg-gray-600 hover:bg-gray-700': !showContent,
            }"
                class="text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Classroom
            </button>
            <button
                @click="showContent = false; showForum = true"
                :class="{
              'bg-blue-600 hover:bg-blue-700': showForum,
              'bg-gray-600 hover:bg-gray-700': !showForum,
            }"
                class="text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Forum
            </button>
          </div>

          <div v-if="showContent" class="bg-form-bg p-6 rounded-xl shadow-2xl">
            <h2 class="text-2xl font-bold mb-4">{{ currentClass }} Classroom Content</h2>
            <div v-if="editingContent" class="space-y-4">
            <textarea
                v-model="editableContent"
                class="w-full h-48 bg-input-bg text-white rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
              <div class="flex justify-end">
                <button
                    @click="saveContent"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Save
                </button>
                <button
                    @click="cancelEdit"
                    class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div v-else v-html="classData?.content" class="prose lg:prose-xl"></div>
            <button
                v-if="hasEditPermission && !editingContent"
                @click="startEdit"
                class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit Content
            </button>
          </div>

          <div v-if="showForum" class="bg-form-bg p-6 rounded-xl shadow-2xl">
            <h2 class="text-2xl font-bold mb-4">{{ currentClass }} Forum</h2>
            <div v-if="newPostVisible">
            <textarea
                v-model="newPostContent"
                placeholder="Write your post..."
                class="w-full h-24 bg-input-bg text-white rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
              <div class="flex justify-end mt-2">
                <button
                    @click="submitPost"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Post
                </button>
                <button
                    @click="newPostVisible = false"
                    class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
            <button
                v-else
                @click="newPostVisible = true"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
              New Post
            </button>
            <div v-for="post in classData?.forumPosts" :key="post.id" class="mb-4 p-4 rounded-lg bg-input-bg">
              <p class="font-bold">{{ post.user }}</p>
              <p>{{ post.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MenuLayout>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { ref, watch, computed } from 'vue';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();

interface Post {
  id: number;
  user: string;
  content: string;
}

interface ClassData {
  content: string;
  forumPosts: Post[];
}

const classes = ref<{ [key: string]: ClassData }>({
  english: { content: "<h1>English Class</h1><p>Welcome to English class!</p>", forumPosts: [] },
  math: { content: "<h1>Math Class</h1><p>Welcome to Math class!</p>", forumPosts: [] },
  science: { content: "<h1>Science Class</h1><p>Welcome to Science class!</p>", forumPosts: [] },
  history: {content: "<h1>History Class</h1><p>Welcome to History Class!</p>", forumPosts: []}
});

const currentClass = ref<string | null>(null);
const classData = ref<ClassData | null>(null);
const showContent = ref(true);
const showForum = ref(false);
const editableContent = ref('');
const editingContent = ref(false);
const hasEditPermission = ref(true);
const newPostContent = ref('');
const newPostVisible = ref(false);
const nextPostId = ref(1);

const availableClasses = computed(() => Object.keys(classes.value));

const updateClassData = () => {
  currentClass.value = route.params.class as string || null;
  classData.value = classes.value[currentClass.value || ''] || null;
  if (!classData.value) {
    showContent.value = true;
    showForum.value = false;
  }
};

watch(
    () => route.params.class,
    () => {
      updateClassData();
    }
);

updateClassData();

const startEdit = () => {
  editableContent.value = classData.value?.content || '';
  editingContent.value = true;
};

const cancelEdit = () => {
  editingContent.value = false;
};

const saveContent = () => {
  if (classData.value) {
    classData.value.content = editableContent.value;
  }
  editingContent.value = false;
};

const submitPost = () => {
  if (newPostContent.value.trim() !== '' && classData.value) {
    const newPost: Post = {
      id: nextPostId.value++,
      user: 'CurrentUser', // Replace with actual user info later
      content: newPostContent.value,
    };
    classData.value.forumPosts.push(newPost);
    newPostContent.value = '';
    newPostVisible.value = false;
  }
};
</script>

<style scoped>
.prose {
  max-width: none;
}
</style>