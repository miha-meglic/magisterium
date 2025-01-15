<template>
  <MenuLayout title="Chat Room">
    <div class="bg-dark-blue min-h-screen text-white p-4 w-full">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-center">Classroom</h1>
      </header>

      <div class="container mx-auto">
        <div v-if="!classData" class="bg-form-bg p-6 rounded-xl shadow-2xl">
          <h2 class="text-2xl font-bold mb-4">Available Classes</h2>
          <ul class="space-y-2">
            <li v-for="classroom in getClasses()" :key="classroom.id">
              <NuxtLink :to="`/class/${classroom.id}`"
                        class="block py-2 px-4 bg-input-bg rounded-lg hover:bg-gray-700 transition">
                {{ classroom.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div v-else class="center w-[calc(100vw-30vw)] h-[calc(100vh-15vh)]">
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

          <div v-if="showContent" class="bg-form-bg p-6 rounded-xl shadow-2xl w-full">
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

          <div v-if="showForum" class="bg-form-bg p-6 rounded-xl shadow-2xl w-full">
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
            <div v-for="post in classData?.forumPosts.slice().reverse()" :key="post.id" class="mb-4 p-4 rounded-lg bg-input-bg">
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
import { useRoute, useCookie } from 'nuxt/app';
import { ref, watch, computed } from 'vue';
import type {Classroom} from '~/types.vue';
import axios from 'axios';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const config = useRuntimeConfig();
const apiBaseClassroomUrl = config.public.apiBaseClassroom;

interface Post {
  id: number;
  user: string;
  content: string;
}

interface ClassData {
  content: string;

  forumPosts: Post[];
}

const classes = ref([]);

const currentClass = ref<string | null>(null);
const classData = ref<ClassData | null>(null);
const currentClassId = ref<string | null>(null);
const showContent = ref(true);
const showForum = ref(false);
const editableContent = ref('');
const editingContent = ref(false);
const hasEditPermission = ref(true);
const newPostContent = ref('');
const newPostVisible = ref(false);
const nextPostId = ref(1);

const fetchClasses = async () => {
  const selectedTenantCookie = useCookie('selectedTenant');
  if (!selectedTenantCookie.value) {
    console.warn("No tenant selected in cookie. Cannot load classes.");
    return;
  }

  try {
    const selectedTenant = selectedTenantCookie.value;
    if (!selectedTenant) {
      console.warn("Invalid tenant data in cookie. Cannot load classes.");
      return;
    }
    const response = await axios.get(apiBaseClassroomUrl + '/classrooms/' + selectedTenant, {
      withCredentials: true
    });
    classes.value = response.data;
  } catch (error) {
    console.error("Error loading classes:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
    }
  }
}

const getClasses = () => {
  return classes.value
}

const fetchClassData = async (classroomId: string) => {
  const selectedTenantCookie = useCookie('selectedTenant');
  if (!selectedTenantCookie.value) {
    console.warn("No tenant selected in cookie. Cannot load class data.");
    return;
  }

  try {
    const selectedTenant = selectedTenantCookie.value;
    if (!selectedTenant) {
      console.warn("Invalid tenant data in cookie. Cannot load class data.");
      return;
    }
    const response = await axios.get<ClassData>(apiBaseClassroomUrl + '/classroom/'+ selectedTenant+'/'+ classroomId, {
      withCredentials: true
    });
    classData.value = response.data;
  } catch (error) {
    console.error("Error loading class data:", error);
    classData.value = null;
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
    }
  }
}
const updateClassData = () => {
  currentClassId.value = route.params.class as string || null;
  if (currentClassId.value) {
    fetchClassData(currentClassId.value);
  } else {
    classData.value = null;
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

const saveContent = async () => {
  if (classData.value) {
    const selectedTenantCookie = useCookie('selectedTenant');
    if (!selectedTenantCookie.value) {
      console.warn("No tenant selected in cookie. Cannot save content.");
      return;
    }

    try {
      const selectedTenant = selectedTenantCookie.value;
      if (!selectedTenant) {
        console.warn("Invalid tenant data in cookie. Cannot save content.");
        return;
      }
      const response = await axios.patch(`${apiBaseClassroomUrl}/classroom/${selectedTenant}/${currentClassId.value}/content`, {content: editableContent.value}, {
        withCredentials: true
      });
      classData.value.content = editableContent.value;
    } catch (error) {
      console.error("Error saving content:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data || error.message);
      }
    }
    editingContent.value = false;
  }
};

const submitPost = async () => {
  if (newPostContent.value.trim() !== '' && classData.value) {
    const selectedTenantCookie = useCookie('selectedTenant');
    if (!selectedTenantCookie.value) {
      console.warn("No tenant selected in cookie. Cannot submit post.");
      return;
    }

    try {
      const selectedTenant = selectedTenantCookie.value;
      if (!selectedTenant) {
        console.warn("Invalid tenant data in cookie. Cannot submit post.");
        return;
      }
      const response = await axios.post(`${apiBaseClassroomUrl}/classroom/${selectedTenant}/${currentClassId.value}/forumPost`, {content: newPostContent.value}, {
        withCredentials: true
      });
      const forumPost:Post = {content: newPostContent.value, id: -1, user: ""}
      classData.value.forumPosts.push(forumPost);
    } catch (error) {
      console.error("Error submitting post:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data || error.message);
      }
    }
    newPostContent.value = '';
    newPostVisible.value = false;
  }
};

onMounted(async () => {
  await fetchClasses();
});

</script>

<style scoped>
.prose {
  max-width: none;
}
</style>