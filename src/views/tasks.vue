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
            <router-link to="/classes" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
              Classes
            </router-link>
            <router-link to="/tasks" class="flex items-center px-3 py-2 text-sm font-medium text-gray-900">
              Tasks
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
          <button
            @click="showAddTask = true"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Add Task
          </button>
        </div>

        <!-- Task Filters -->
        <div class="flex space-x-4 mb-6">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="[
              'px-4 py-2 rounded-md',
              activeFilter === filter.value 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>

        <!-- Tasks List -->
        <div class="bg-white shadow rounded-lg">
          <div v-if="filteredTasks.length === 0" class="p-6 text-center text-gray-500">
            No tasks found
          </div>
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="task in filteredTasks"
              :key="task.id"
              class="p-4 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    :checked="task.completed"
                    @change="toggleTask(task)"
                    class="h-4 w-4 text-indigo-600 rounded"
                  />
                  <div>
                    <div :class="['font-medium', task.completed && 'line-through text-gray-500']">
                      {{ task.title }}
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ task.description }}
                    </div>
                    <div class="text-sm text-gray-500 mt-1">
                      Due: {{ formatDate(task.due_date) }}
                      <span v-if="task.category" class="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                        {{ task.category }}
                      </span>
                      <span 
                        class="ml-2 px-2 py-1 rounded text-xs"
                        :class="getPriorityClass(task.priority)"
                      >
                        {{ getPriorityLabel(task.priority) }}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  @click="deleteTask(task.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Task Modal -->
        <div v-if="showAddTask" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-lg font-bold mb-4">Add New Task</h2>
            
            <div class="space-y-4">
              <input
                v-model="newTask.title"
                placeholder="Task title"
                class="w-full px-3 py-2 border rounded-md"
                required
              />
              
              <textarea
                v-model="newTask.description"
                placeholder="Description (optional)"
                rows="2"
                class="w-full px-3 py-2 border rounded-md"
              />
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  v-model="newTask.due_date"
                  type="date"
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select v-model="newTask.category" class="w-full px-3 py-2 border rounded-md">
                  <option value="general">General</option>
                  <option value="planning">Planning</option>
                  <option value="marking">Marking</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select v-model="newTask.priority" class="w-full px-3 py-2 border rounded-md">
                  <option :value="1">Low</option>
                  <option :value="2">Medium</option>
                  <option :value="3">High</option>
                </select>
              </div>
            </div>

            <div class="mt-6 flex space-x-3">
              <button
                @click="addTask"
                class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Task
              </button>
              <button
                @click="showAddTask = false"
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
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'

const tasks = ref([])
const showAddTask = ref(false)
const activeFilter = ref('pending')

const filters = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All Tasks' }
]

const newTask = ref({
  title: '',
  description: '',
  due_date: '',
  category: 'general',
  priority: 2,
  completed: false
})

const filteredTasks = computed(() => {
  switch (activeFilter.value) {
    case 'pending':
      return tasks.value.filter(t => !t.completed)
    case 'completed':
      return tasks.value.filter(t => t.completed)
    default:
      return tasks.value
  }
})

onMounted(() => {
  fetchTasks()
})

async function fetchTasks() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true })
  
  tasks.value = data || []
}

async function addTask() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      ...newTask.value
    })
  
  if (!error) {
    await fetchTasks()
    showAddTask.value = false
    newTask.value = {
      title: '',
      description: '',
      due_date: '',
      category: 'general',
      priority: 2,
      completed: false
    }
  }
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

async function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    
    if (!error) {
      await fetchTasks()
    }
  }
}

function formatDate(date) {
  if (!date) return 'No due date'
  return dayjs(date).format('MMM D, YYYY')
}

function getPriorityLabel(priority) {
  switch (priority) {
    case 1: return 'Low'
    case 3: return 'High'
    default: return 'Medium'
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case 1: return 'bg-gray-100 text-gray-600'
    case 3: return 'bg-red-100 text-red-600'
    default: return 'bg-yellow-100 text-yellow-600'
  }
}
</script>