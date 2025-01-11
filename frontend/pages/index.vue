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
                  v-for="(subject, day) in timeSlot.subjects"
                  :key="day"
                  class="border border-gray-600 px-4 py-2"
                  :class="{ 'bg-sky-600': subject }"
              >
                {{ subject }}
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

<script>
import MenuLayout from '~/components/MenuLayout.vue';

export default {
  components: {
    MenuLayout,
  },
  data() {
    return {
      timetableDays: [],
      timetable: [],
      calendarDays: [],
      selectedDate: null,
      popupVisible: false,
      loadingTimetable: true,
      weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      currentWeek: new Date(),
      currentMonth: new Date()
    };
  },
  async mounted() {
    await this.loadTimetable();
    this.generateCalendarDays();
  },
  methods: {
    weekRange() {
      const startOfWeek = this.getStartOfWeek(new Date(this.currentWeek));
      const endOfWeek = this.getEndOfWeek(new Date(this.currentWeek));

      return `${startOfWeek.getDate()}.${startOfWeek.getMonth() + 1}. - ${endOfWeek.getDate()}.${endOfWeek.getMonth() + 1}.`;
    },
    monthAndYear() {
      const month = this.currentMonth.toLocaleString('default', { month: 'long' });
      const year = this.currentMonth.getFullYear();
      return `${month} ${year}`;
    },
    async loadTimetable() {
      this.loadingTimetable = true;
      try {
        const response = await this.fetchTimetable();
        this.processTimetable(response);
      } catch (error) {
        console.error('Error fetching timetable:', error);
      } finally {
        this.loadingTimetable = false;
      }
    },
    async fetchTimetable() {
      // Mocked API response
      return new Promise((resolve) => {
        setTimeout(() => { // Spoofed data
          resolve({
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            data: [
              {
                time: '08:00 - 09:00',
                subjects: {
                  Mon: 'Math',
                  Tue: 'Science',
                  Wed: 'History',
                  Thu: 'PE',
                  Fri: 'English',
                },
              },
              {
                time: '09:00 - 10:00',
                subjects: {
                  Mon: 'Biology',
                  Tue: 'Chemistry',
                  Wed: 'Physics',
                  Thu: 'Music',
                },
              },
            ],
          });
        }, 1000);
      });
    },
    processTimetable(response) {
      this.timetableDays = response.days;
      this.timetable = response.data.map((slot) => ({
        time: slot.time,
        subjects: this.timetableDays.reduce((acc, day) => {
          acc[day] = slot.subjects[day] || '';
          return acc;
        }, {}),
      }));
    },
    generateCalendarDays() {
      const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
      const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
      const firstDayOfWeek = firstDay.getDay();

      const days = [];
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ day: '', notifications: 0, isPlaceholder: true });
      }
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const notificationCount = Math.floor(Math.random() * 6); // Random notifications for demonstration
        days.push({ day: i, notifications: notificationCount, isPlaceholder: false });
      }

      this.calendarDays = days;
    },
    getStartOfWeek(date) {
      const day = date.getDay();
      return new Date(date.setDate(date.getDate() - day + 1)); // Adjust for Monday as start of week
    },
    getEndOfWeek(date) {
      const day = date.getDay();
      return new Date(date.setDate(date.getDate() + (7 - day)));
    },
    loadPreviousWeek() {
      this.currentWeek.setDate(this.currentWeek.getDate() - 7);
      this.loadTimetable();
    },
    loadNextWeek() {
      this.currentWeek.setDate(this.currentWeek.getDate() + 7);
      this.loadTimetable();
    },
    loadPreviousMonth() {
      this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
      this.generateCalendarDays();
    },
    loadNextMonth() {
      this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
      this.generateCalendarDays();
    },
    getValidDayClass(date) {
      if (date.isPlaceholder) return '';
      if (date.notifications === 0) return 'bg-gray-700';
      return '';
    },
    getNotificationClass(notificationCount) {
      if (notificationCount === 1) return 'bg-sky-700';
      if (notificationCount === 2) return 'bg-violet-600';
      if (notificationCount === 3) return 'bg-fuchsia-600';
      if (notificationCount === 4) return 'bg-pink-600';
      return 'bg-red-600';
    },
    openPopup(date) {
      if (!date.isPlaceholder && date.notifications > 0) {
        this.selectedDate = date;
        this.popupVisible = true;
      }
    },
    closePopup() {
      this.popupVisible = false;
      this.selectedDate = null;
    },
  },
};
</script>
