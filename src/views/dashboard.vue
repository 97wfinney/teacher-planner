<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex space-x-8">
            <router-link to="/" class="flex items-center px-3 py-2 text-sm font-medium text-gray-900">
              Dashboard
            </router-link>
            <router-link to="/timetable" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
              Timetable
            </router-link>
            <router-link to="/classes" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
              Classes
            </router-link>
            <router-link to="/tasks" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
              Tasks
            </router-link>
            <router-link to="/settings" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
              Settings
            </router-link>
          </div>
          <button
            @click="signOut"
            class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Today's Overview</h1>
        
        <!-- Today's Lessons -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Today's Lessons</h2>
          <div v-if="todaysLessons.length === 0" class="text-gray-500">
            No lessons scheduled for today
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="lesson in todaysLessons"
              :key="lesson.id"
              class="border-l-4 border-indigo-500 pl-4 py-2"
            >
              <div class="font-medium">Period {{ lesson.period }}: {{ lesson.class_name }}</div>
              <div v-if="lesson.topic" class="text-sm text-gray-600">{{ lesson.topic }}</div>
            </div>
          </div>
        </div>

        <!-- Upcoming Tasks -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Upcoming Tasks</h2>
          <div v-if="upcomingTasks.length === 0" class="text-gray-500">
            No upcoming tasks
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="task in upcomingTasks"
              :key="task.id"
              class="flex items-center justify-between"
            >
              <div>
                <div class="font-medium">{{ task.title }}</div>
                <div class="text-sm text-gray-600">Due: {{ formatDate(task.due_date) }}</div>
              </div>
              <button
                @click="toggleTask(task)"
                class="px-3 py-1 text-sm border rounded"
                :class="task.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ task.completed ? 'Done' : 'Mark Done' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'

const router = useRouter()
const todaysLessons = ref([])
const upcomingTasks = ref([])

onMounted(async () => {
  await fetchTodaysLessons()
  await fetchUpcomingTasks()
})

async function fetchTodaysLessons() {
  const today = dayjs().format('YYYY-MM-DD')
  const { data } = await supabase
    .from('lessons_with_details')
    .select('*')
    .eq('date', today)
    .order('period')
  
  todaysLessons.value = data || []
}

async function fetchUpcomingTasks() {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('completed', false)
    .gte('due_date', dayjs().format('YYYY-MM-DD'))
    .order('due_date')
    .limit(5)
  
  upcomingTasks.value = data || []
}

async function toggleTask(task) {
  const { error } = await supabase
    .from('tasks')
    .update({ completed: !task.completed })
    .eq('id', task.id)
  
  if (!error) {
    task.completed = !task.completed
  }
}

async function signOut() {
  await supabase.auth.signOut()
  router.push('/login')
}

function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY')
}
</script>