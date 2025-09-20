<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow mb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex space-x-8">
            <router-link to="/" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
              Dashboard
            </router-link>
            <router-link to="/timetable" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
              Timetable
            </router-link>
            <router-link to="/classes" class="flex items-center px-3 py-2 text-sm font-medium text-gray-900">
              Classes
            </router-link>
            <router-link to="/tasks" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
              Tasks
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">My Classes</h1>
          <button
            @click="showAddClass = true"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Add Class
          </button>
        </div>

        <!-- Classes Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="cls in classes"
            :key="cls.id"
            class="bg-white shadow rounded-lg p-6 border-t-4"
            :style="`border-color: ${cls.color}`"
          >
            <h3 class="font-bold text-lg mb-2">{{ cls.name }}</h3>
            <p class="text-gray-600 mb-4">{{ cls.year_group }} - {{ cls.subject }}</p>
            
            <div class="space-y-2">
              <button
                @click="manageStudents(cls)"
                class="w-full text-left px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                👥 Manage Students ({{ cls.student_count || 0 }})
              </button>
              <button
                @click="viewAttendance(cls)"
                class="w-full text-left px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                📊 View Attendance
              </button>
            </div>
          </div>
        </div>

        <!-- Add Class Modal -->
        <div v-if="showAddClass" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-lg font-bold mb-4">Add New Class</h2>
            
            <div class="space-y-4">
              <input
                v-model="newClass.name"
                placeholder="Class Name (e.g., 9A Mathematics)"
                class="w-full px-3 py-2 border rounded-md"
              />
              <input
                v-model="newClass.year_group"
                placeholder="Year Group (e.g., Year 9)"
                class="w-full px-3 py-2 border rounded-md"
              />
              <input
                v-model="newClass.subject"
                placeholder="Subject"
                class="w-full px-3 py-2 border rounded-md"
              />
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Class Color</label>
                <input
                  v-model="newClass.color"
                  type="color"
                  class="w-full h-10"
                />
              </div>
            </div>

            <div class="mt-6 flex space-x-3">
              <button
                @click="addClass"
                class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Class
              </button>
              <button
                @click="showAddClass = false"
                class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
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
import { supabase } from '../lib/supabase'

const classes = ref([])
const showAddClass = ref(false)
const newClass = ref({
  name: '',
  year_group: '',
  subject: '',
  color: '#3B82F6'
})

onMounted(() => {
  fetchClasses()
})

async function fetchClasses() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data } = await supabase
    .from('classes')
    .select(`
      *,
      students (count)
    `)
    .eq('user_id', user.id)
    .order('name')
  
  classes.value = data || []
}

async function addClass() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase
    .from('classes')
    .insert({
      user_id: user.id,
      ...newClass.value
    })
  
  if (!error) {
    await fetchClasses()
    showAddClass.value = false
    newClass.value = {
      name: '',
      year_group: '',
      subject: '',
      color: '#3B82F6'
    }
  }
}

function manageStudents(cls) {
  // TODO: Navigate to student management
  console.log('Manage students for', cls.name)
}

function viewAttendance(cls) {
  // TODO: Navigate to attendance view
  console.log('View attendance for', cls.name)
}
</script>