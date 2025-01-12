<template>
  <div class="bg-dark-blue min-h-screen text-white p-4">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-center">Classroom Website</h1>
    </header>

    <div class="container mx-auto">
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
        <h2 class="text-2xl font-bold mb-4">Classroom Content</h2>
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
        <div v-else v-html="classroomContent" class="prose lg:prose-xl"></div>
        <button
            v-if="hasEditPermission && !editingContent"
            @click="startEdit"
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Edit Content
        </button>
      </div>

      <div v-if="showForum" class="bg-form-bg p-6 rounded-xl shadow-2xl">
        <h2 class="text-2xl font-bold mb-4">Forum</h2>
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
        <div v-for="post in forumPosts" :key="post.id" class="mb-4 p-4 rounded-lg bg-input-bg">
          <p class="font-bold">{{ post.user }}</p>
          <p>{{ post.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      showContent: true, // Classroom is open by default
      showForum: false,
      classroomContent: '',
      editableContent: '',
      editingContent: false,
      hasEditPermission: true,
      forumPosts: [],
      newPostContent: '',
      newPostVisible: false,
    };
  },
  mounted() {
    this.loadContent();
    this.loadForumPosts();
  },
  methods: {
    async loadContent() {
      try {
        const response = await axios.get('/api/classroom-content'); // Replace with your API endpoint
        this.classroomContent = response.data.content;
      } catch (error) {
        console.error('Error loading content:', error);
      }
    },
    startEdit() {
      this.editableContent = this.classroomContent;
      this.editingContent = true;
    },
    cancelEdit() {
      this.editingContent = false;
    },
    async saveContent() {
      try {
        await axios.post('/api/classroom-content', { content: this.editableContent }); // Replace with your API endpoint
        this.classroomContent = this.editableContent;
        this.editingContent = false;
      } catch (error) {
        console.error('Error saving content:', error);
      }
    },
    async loadForumPosts() {
      try {
        const response = await axios.get('/api/forum-posts'); // Replace with your API endpoint
        this.forumPosts = response.data;
      } catch (error) {
        console.error('Error loading forum posts:', error);
      }
    },
    async submitPost() {
      try {
        await axios.post('/api/forum-posts', { content: this.newPostContent, user: 'CurrentUser' }); // Replace 'CurrentUser' with actual user data
        this.newPostContent = '';
        this.newPostVisible = false;
        this.loadForumPosts(); // Refresh posts
      } catch (error) {
        console.error('Error submitting post:', error);
      }
    },
  },
};
</script>

<style scoped>
.prose {
  max-width: none;
}
</style>