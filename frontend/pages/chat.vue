<template>
  <MenuLayout title="Chat Room">
    <main class="flex min-w-300px w-[calc(100vw-30vw)] h-[calc(100vh-15vh)] bg-gray-800 text-white">
      <!-- Sidebar -->
      <div class="w-120px bg-blue-bg flex flex-col p-6">
        <!-- New Message Button -->
        <button
            @click="openNewMessagePopup"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded mb-6"
        >
          New Message
        </button>
        <!-- Recipient List -->
        <ul class="space-y-4">
          <li
              v-for="(recipient, index) in recipients"
              :key="recipient.id"
              @click="openChat(index)"
              class="p-3 rounded cursor-pointer hover:bg-blue-700 transition"
              :class="{ 'bg-blue-700': selectedRecipientIndex === index }"
          >
            {{ recipient.name }}
          </li>
        </ul>
      </div>

      <!-- Chat Window -->
      <div class="flex-1 flex flex-col p-6 bg-gray-900">
        <!-- Placeholder for No Chat Selected -->
        <div v-if="selectedRecipientIndex === null" class="flex items-center justify-center h-full text-gray-400">
          Select a chat to start messaging.
        </div>

        <!-- Chat Content -->
        <div v-else class="h-full flex flex-col bg-gray-800 rounded-lg">
          <!-- Chat Header -->
          <div class="bg-blue-800 p-6 rounded-t-lg text-lg font-bold">
            Chat with {{ recipients[selectedRecipientIndex].name }}
          </div>
          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto bg-gray-800 p-6 space-y-4">
            <div
                v-for="(message, index) in recipients[selectedRecipientIndex].messages"
                :key="index"
                class="flex"
            >
            <div
                :class="{
                'self-end right-0 text-right ml-auto bg-blue-600': message.sender === 'me',
                'self-start bg-gray-700': message.sender !== 'me',
              }"
                class="px-4 py-3 rounded-lg max-w-[90%] text-wrap break-all"
            >
              {{ message.text }}
              </div>
            </div>
          </div>
          <!-- Message Input -->
          <div class="bg-gray-700 p-6 rounded-b-lg flex items-center space-x-4">
            <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="Type a message..."
                class="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg outline-none"
            />
            <button
                @click="sendMessage"
                class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <!-- New Message Popup -->
      <div v-if="newMessagePopupVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
        <div class="bg-dark-blue p-8 rounded-lg shadow-xl text-white w-96">
          <h3 class="text-lg font-bold mb-4">Start a New Chat</h3>
          <ul class="space-y-3">
            <li
                v-for="user in allUsers"
                :key="user.id"
                @click="selectRecipient(user)"
                class="p-3 rounded cursor-pointer hover:bg-blue-700 transition"
            >
              {{ user.name }}
            </li>
          </ul>
          <button
              @click="closeNewMessagePopup"
              class="w-full mt-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </main>
  </MenuLayout>
</template>

<script>
import MenuLayout from '~/components/MenuLayout.vue';

export default {
  components: {
    MenuLayout,
  },
  data() {
    return {
      recipients: [],
      allUsers: [],
      selectedRecipientIndex: null,
      newMessage: '',
      newMessagePopupVisible: false,
    };
  },
  async mounted() {
    await this.loadRecipients();
    await this.loadAllUsers();
  },
  methods: {
    async loadRecipients() {
      // Simulated API call to fetch recipient list
      this.recipients = [
        { id: 1, name: 'Alice', messages: [{ sender: 'me', text: 'Hi Alice!' }] },
        { id: 2, name: 'Bob', messages: [{ sender: 'Bob', text: 'Hey there!' }] },
      ];
    },
    async loadAllUsers() {
      // Simulated API call to fetch all users
      this.allUsers = [
        { id: 1, name: 'Alice' }, // Example existing user
        { id: 2, name: 'Bob' }, // Example existing user
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'Diana' },
        { id: 5, name: 'Eve' },
      ];
    },
    openChat(index) {
      this.selectedRecipientIndex = index;
    },
    openNewMessagePopup() {
      this.newMessagePopupVisible = true;
    },
    closeNewMessagePopup() {
      this.newMessagePopupVisible = false;
    },
    selectRecipient(user) {
      // Check if the user is already in the recipients list
      const existingIndex = this.recipients.findIndex((recipient) => recipient.id === user.id);
      if (existingIndex !== -1) {
        // Open the existing chat
        this.newMessagePopupVisible = false;
        this.openChat(existingIndex);
      } else {
        // Add new recipient and open chat
        const newRecipient = { id: user.id, name: user.name, messages: [] };
        this.recipients.push(newRecipient);
        this.newMessagePopupVisible = false;
        this.openChat(this.recipients.length - 1);
      }
    },
    sendMessage() {
      if (this.newMessage.trim() && this.selectedRecipientIndex !== null) {
        this.recipients[this.selectedRecipientIndex].messages.push({
          sender: 'me',
          text: this.newMessage,
        });
        this.newMessage = '';
      }
    },
  },
};
</script>
