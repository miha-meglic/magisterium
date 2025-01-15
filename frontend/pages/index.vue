<script setup lang="ts">
import MenuLayout from '~/components/MenuLayout.vue';
import type { TimetableEntry }  from '~/types.vue';
import axios from "axios";

definePageMeta({
  middleware: ['auth'],
});

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const currentWeek = ref(new Date()); // Must access `.value` when working with refs
const currentMonth = ref(new Date()); // Same here

const config = useRuntimeConfig();
const timetableDays = ref([]);
const timetable = ref([]);
const calendarDays = ref([]);
const selectedDate = ref(null);
const popupVisible = ref(false);
const loadingTimetable = ref(true);
const apiBaseScheduleUrl = config.public.apiBaseSchedule;

async function loadTimetable() {
  loadingTimetable.value = true;
  try {
    const startDate = getStartOfWeek(currentWeek.value).toISOString().slice(0, 10);
    const endDate = getEndOfWeek(currentWeek.value).toISOString().slice(0, 10);

    const response = await fetchTimetable(startDate, endDate);
    processTimetable(response);
  } catch (error) {
    console.error('Error fetching timetable:', error);
  } finally {
    loadingTimetable.value = false;
  }
}


async function fetchTimetable(startDate: string, endDate: string) {
  const selectedTenantCookie = useCookie('selectedTenant');
  if (!selectedTenantCookie.value) {
    console.warn("No tenant selected in cookie. Cannot load schedule.");
    return null;
  }

  try {
    const selectedTenant = selectedTenantCookie.value;
    if (!selectedTenant) {
      console.warn("Invalid tenant data in cookie. Cannot load schedule.");
      return null;
    }

    const response = await axios.post<TimetableEntry[]>(apiBaseScheduleUrl + '/schedule/' +selectedTenant, {
      from: startDate,
      to: endDate},
    {withCredentials: true},
    );
    return response.data ? response.data : [];
  } catch (error) {
    console.error("Error fetching timetable:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
    }
    return null;
  }
}


function weekRange() {
  const startOfWeek = getStartOfWeek(currentWeek.value);
  const endOfWeek = getEndOfWeek(currentWeek.value);

  return `${startOfWeek.getDate()}.${startOfWeek.getMonth() + 1}. - ${endOfWeek.getDate()}.${endOfWeek.getMonth() + 1}.`;
}

function monthAndYear() {
  return `${currentMonth.value.toLocaleString('default', {
    month: 'long',
  })} ${currentMonth.value.getFullYear()}`;
}

function processTimetable(response) {
  // Reset Timetable Data
  timetableDays.value = [];
  timetable.value = [];

  // Loop through each event in the response
  for (const event of response) {
    timetableDays.value = [];
    timetable.value = [];

    if (!response || response.length === 0) return; // Handle empty response

    // Find min and max times
    let minTime = new Date(response[0].start);
    let maxTime = new Date(response[0].start);

    for (const event of response) {
      const startTime = new Date(event.start);
      if (startTime < minTime) minTime = startTime;
      if (startTime > maxTime) maxTime = startTime;

      const eventDate = event.start.slice(0, 10);
      if (!timetableDays.value.includes(getWeekday(new Date(eventDate)))) {
        timetableDays.value.push(getWeekday(new Date(eventDate)));
      }
    }

    // Round min/max to nearest hour
    minTime.setMinutes(0, 0, 0);
    maxTime.setMinutes(0, 0, 0);
    maxTime.setHours(maxTime.getHours() + 1); // Round up to next hour

    let currentTime = new Date(minTime);
    while (currentTime <= maxTime) {
      const timeString = currentTime.toISOString().slice(11, 16);
      const timeSlot = { time: timeString, subjects: {} };
      for (const day of timetableDays.value) {
        timeSlot.subjects[day] = [];
      }
      timetable.value.push(timeSlot);
      currentTime.setHours(currentTime.getHours() + 1);
    }

    for (const event of response) {
      const eventStartTime = new Date(event.start);
      const eventDate = getWeekday(new Date(event.start.slice(0, 10)));

      // Find the correct timeslot based on range
      for (const timeSlot of timetable.value) {
        const slotStartTime = new Date(minTime);
        const [hours, minutes] = timeSlot.time.split(':').map(Number);
        slotStartTime.setHours(hours, minutes, 0, 0);
        const slotEndTime = new Date(slotStartTime);
        slotEndTime.setHours(slotEndTime.getHours() + 1);

        if (eventStartTime >= slotStartTime && eventStartTime < slotEndTime) {
          timeSlot.subjects[eventDate].push(event.classroomName);
          break;
        }
      }
    }
  }
}

function getTimeTableDays()
{
  return timetableDays.value;
}
  function getWeekday(date: Date):string
{
  return date.toLocaleDateString('en-US',{weekday: 'short'});
}
function generateCalendarDays() {
  const firstDay = new Date(
      currentMonth.value.getFullYear(),
      currentMonth.value.getMonth(),
      1
  );
  const lastDay = new Date(
      currentMonth.value.getFullYear(),
      currentMonth.value.getMonth() + 1,
      0
  );
  const firstDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: '', notifications: 0, isPlaceholder: true });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const notificationCount = Math.floor(Math.random() * 6); // Random notifications for demonstration
    days.push({ day: i, notifications: notificationCount, isPlaceholder: false });
  }

  calendarDays.value = days;
}

function getStartOfWeek(date) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day + 1); // Adjust for Monday as start of week
  return start;
}

function getEndOfWeek(date) {
  const end = new Date(date);
  const day = end.getDay();
  end.setDate(end.getDate() + (7 - day));
  return end;
}

function loadPreviousWeek() {
  currentWeek.value.setDate(currentWeek.value.getDate() - 7);
  loadTimetable();
}

function loadNextWeek() {
  currentWeek.value.setDate(currentWeek.value.getDate() + 7);
  loadTimetable();
}

function loadPreviousMonth() {
  currentMonth.value.setMonth(currentMonth.value.getMonth() - 1);
  generateCalendarDays();
}

function loadNextMonth() {
  currentMonth.value.setMonth(currentMonth.value.getMonth() + 1);
  generateCalendarDays();
}

function getValidDayClass(date) {
  if (date.isPlaceholder) return '';
  if (date.notifications === 0) return 'bg-gray-700';
  return '';
}

function getNotificationClass(notificationCount) {
  if (notificationCount === 1) return 'bg-sky-700';
  if (notificationCount === 2) return 'bg-violet-600';
  if (notificationCount === 3) return 'bg-fuchsia-600';
  if (notificationCount === 4) return 'bg-pink-600';
  return 'bg-red-600';
}

function openPopup(date) {
  if (!date.isPlaceholder && date.notifications > 0) {
    selectedDate.value = date;
    popupVisible.value = true;
  }
}

function closePopup() {
  popupVisible.value = false;
  selectedDate.value = null;
}

// Ensure mounted lifecycle hooks are used in setup
onMounted(async () => {
  await loadTimetable();
  generateCalendarDays();
});
</script>


<template>
  <MenuLayout title="Schedule">
    <main class="p-6 space-y-8">
      <!-- Timetable Section -->
      <section class="bg-form-bg p-6 rounded-xl shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <button
              @click="loadPreviousWeek"
              class="text-white hover:opacity-75 transition"
          >
            &larr;
          </button>
          <h2 class="text-2xl font-bold text-center text-white">
            {{ weekRange() }}
          </h2>
          <button
              @click="loadNextWeek"
              class="text-white hover:opacity-75 transition"
          >
            &rarr;
          </button>
        </div>
        <div v-if="loadingTimetable" class="text-center text-gray-300">Loading timetable...</div>
        <div v-else class="overflow-x-auto">
          <table class="table-auto w-full border-collapse border border-gray-600 text-white">
            <thead>
            <tr class="bg-dark-blue">
              <th class="border border-gray-600 px-4 py-2 text-left">Time</th>
              <th
                  v-for="day in timetableDays"
                  :key="day"
                  class="border border-gray-600 px-4 py-2 text-left"
              >
                {{ day }}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(timeSlot, index) in timetable" :key="index">
              <td class="border border-gray-600 bg-blue-900 px-4 py-2">{{ timeSlot.time }}</td>
              <td
                  v-for="day in getTimeTableDays()"
                  :key="day"
                  class="border border-gray-600 px-4 py-2"
                  :class="{ 'bg-sky-600': timeSlot.subjects[day] }"
              >
                {{ timeSlot.subjects[day][0] || '' }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Calendar Section -->
      <section class="bg-form-bg p-6 rounded-xl shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <button
              @click="loadPreviousMonth"
              class="text-white hover:opacity-75 transition"
          >
            &larr;
          </button>
          <h2 class="text-2xl font-bold text-center text-white">
            {{ monthAndYear() }}
          </h2>
          <button
              @click="loadNextMonth"
              class="text-white hover:opacity-75 transition"
          >
            &rarr;
          </button>
        </div>
        <div>
          <!-- Calendar Header -->
          <div class="grid grid-cols-7 text-center font-semibold text-gray-300">
            <div v-for="day in weekDays" :key="day" class="p-2 bg-dark-blue border border-gray-600">
              {{ day }}
            </div>
          </div>
          <!-- Calendar Days -->
          <div class="grid grid-cols-7 text-center">
            <div
                v-for="(date, index) in calendarDays"
                :key="index"
                class="p-4 border border-gray-600 hover:opacity-90 transition cursor-pointer rounded-lg relative flex items-center justify-center"
                :class="[getValidDayClass(date)]"
                @click="openPopup(date)"
            >
              <!-- Circle Background -->
              <span
                  v-if="date.notifications > 0"
                  :class="[getNotificationClass(date.notifications), 'absolute rounded-full w-8 h-8 z-0']"
              ></span>
              <!-- Day Number -->
              <span class="relative z-10 font-bold">{{ date.day }}</span>
            </div>
          </div>
        </div>
        <!-- Popup Modal -->
        <div
            v-if="popupVisible"
            class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        >
          <div class="bg-dark-blue p-6 rounded-lg shadow-xl text-white w-96">
            <h3 class="text-lg font-bold mb-4">Notifications for {{ selectedDate?.day }}</h3>
            <ul class="space-y-2">
              <li
                  v-for="(notification, index) in selectedDate?.notifications"
                  :key="index"
                  class="bg-gray-800 p-3 rounded-lg"
              >
                {{ notification }}
              </li>
            </ul>
            <button
                @click="closePopup"
                class="w-full py-2 mt-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </section>
    </main>
  </MenuLayout>
</template>

