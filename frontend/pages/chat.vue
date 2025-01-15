<script setup lang="ts">
import MenuLayout from '~/components/MenuLayout.vue';
import type { User, Tenant, Message} from '~/types.vue';
import axios from 'axios';


definePageMeta({
  middleware: ['auth'],
});

const recipients = ref([]);
const allUsers = ref([]);
const selectedRecipientIndex = ref(null);
let selectedUserId: string = ""
const newMessage = ref('');
const newMessagePopupVisible = ref(false);
const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBase;
const apiBaseMessagingUrl = config.public.apiBaseMessaging;
const recipientsMap = ref<Map<User, Message[]>>(new Map()); // Use a Map

const loadMessagesForContact = async (contact: User): Promise<Message[] | null> => {
  const selectedTenantCookie = useCookie('selectedTenant');
  if (!selectedTenantCookie.value) {
    console.warn("No tenant selected in cookie. Cannot load messages for", contact.id);
    return null;
  }

  try {
    const selectedTenant = selectedTenantCookie.value;
    const response = await axios.get<Message[]>(`${apiBaseMessagingUrl}/message/${selectedTenant}/${contact.id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error loading messages for contact ${contact.id}:`, error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
    }
    return null;
  }
};

const loadAllUsers = async () => {
  const selectedTenantCookie = useCookie('selectedTenant');
  const userCookie = useCookie('selectedUser')
  if(userCookie.value)
  {
    selectedUserId = userCookie.value
  }
  if (!selectedTenantCookie.value) {
    console.warn("No tenant selected in cookie. Cannot load users.");
    allUsers.value = [];
    return;
  }

  try {
    const selectedTenant = selectedTenantCookie.value;
    if (!selectedTenant || !selectedTenant) {
      console.warn("Invalid tenant data in cookie. Cannot load users.");
      allUsers.value = [];
      return;
    }
    const response = await axios.get(apiBaseMessagingUrl+ '/contacts/' + selectedTenant, {
      withCredentials: true
    });

    const filteredUsers = response.data.filter(user => user.id !== selectedUserId);
    allUsers.value = filteredUsers.map((user) => ({ ...user, messages: null }));
  } catch (error) {
    console.error("Error loading recipients:", error);
    allUsers.value = [];
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
    }
  }
};

const loadAllMessages = async () => {
  if (allUsers.value.length === 0) {
    return;
  }

  recipientsMap.value.clear();

  await Promise.all(
      allUsers.value.map(async (recipient) => {
        const messages = await loadMessagesForContact(recipient);
        if (messages) {
          recipientsMap.value.set(recipient, messages);
          recipients.value.push(recipient)
        }
      })
  );
};


const openChat = (index) => {
  selectedRecipientIndex.value = index;
};

const openNewMessagePopup = () => {
  newMessagePopupVisible.value = true;
};

const closeNewMessagePopup = () => {
  newMessagePopupVisible.value = false;
};

const selectRecipient = (user) => {
  // Check if the user is already in the recipients list
  const existingIndex = recipients.value.findIndex((recipient) => recipient.id === user.id);
  if (existingIndex !== -1) {
    // Open the existing chat
    newMessagePopupVisible.value = false;
    openChat(existingIndex);
  } else {
    // Add new recipient and open chat
    const newRecipient = { id: user.id, name: user.name, messages: [] };
    recipients.value.push(newRecipient);
    newMessagePopupVisible.value = false;
    openChat(recipients.value.length - 1);
  }
};

const sendMessage = async () => {
  if (newMessage.value.trim() && selectedRecipientIndex.value !== null && recipients.value.length > 0) {
    const selectedRecipient = recipients.value[selectedRecipientIndex.value];
    const selectedTenantCookie = useCookie('selectedTenant');

    if (!selectedTenantCookie.value) {
      console.warn("No tenant selected in cookie. Cannot send message.");
      return;
    }

    try {
      const selectedTenant = selectedTenantCookie.value;
      const messageToSend = { content: newMessage.value.trim(), sender: '' };

      const response = await axios.post<Message>(apiBaseMessagingUrl + '/message/' + selectedTenant + '/' + selectedRecipient.id,
          messageToSend,
          { withCredentials: true }
      );

      // Add the sent message to the local messages array
      if (response.data) {
        if(!recipientsMap.value.get(selectedRecipient))
        {
          recipientsMap.value.set(selectedRecipient, [])
        }
        messageToSend.sender = selectedUserId

        recipientsMap.value.get(selectedRecipient).push(messageToSend);

      } else {
        console.error("No message data returned from API");
      }
      newMessage.value = ''; // Clear input field
    } catch (error) {
      console.error("Error sending message:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data || error.message);
      }
      // Handle error, e.g., display an error message to the user
    }
  }
};

const getMessagesForSelectedRecipient = () => {
  if (selectedRecipientIndex.value !== null && recipients.value.length > 0) {
    const recipient = recipients.value[selectedRecipientIndex.value];
    const messages = recipientsMap.value.get(recipient);

    if (messages) {
      return messages.slice().sort((a, b) => {
        const idA = typeof a.id === 'string' ? parseInt(a.id) : a.id;
        const idB = typeof b.id === 'string' ? parseInt(b.id) : b.id;
        return idA - idB
      });
    }
  }
  return null;
};

onMounted(async () => {
  await loadAllUsers();
  await loadAllMessages();

});
</script>
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
                v-for="message in getMessagesForSelectedRecipient()"
                :key="message.id"
                class="flex"
            >
            <div
                :class="{
                'self-end right-0 text-right ml-auto bg-blue-600': message.sender === selectedUserId,
                'self-start bg-gray-700': message.sender !== 'me',
              }"
                class="px-4 py-3 rounded-lg max-w-[90%] text-wrap break-all"
            >
              {{ message.content }}
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


