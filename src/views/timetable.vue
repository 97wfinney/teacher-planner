<template>
  <AppLayout>
    <div class="timetable-container">
      <!-- Header -->
      <header class="timetable-header">
        <div class="header-left">
          <h1 class="page-title">Timetable</h1>
          <div class="week-info">
            {{ currentWeekDisplay }}
          </div>
        </div>
        
        <div class="header-controls">
          <button @click="goToToday" class="btn-today">Today</button>
          <div class="week-nav">
            <button @click="previousWeek" class="week-nav-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 14L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button @click="nextWeek" class="week-nav-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8 14L12 10L8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Timetable Grid -->
      <div class="timetable-grid">
        <div class="grid-container">
          <!-- Time labels -->
          <div class="time-column">
            <div class="day-header"></div>
            <div v-for="period in periods" :key="period" class="time-slot">
              <span class="period-label">Period {{ period }}</span>
              <span class="time-label">{{ getPeriodTime(period) }}</span>
            </div>
          </div>

          <!-- Day columns -->
          <div v-for="day in weekDays" :key="day.date" class="day-column">
            <div class="day-header" :class="{ today: isToday(day.date) }">
              <div class="day-name">{{ day.name }}</div>
              <div class="day-date">{{ day.dayNum }}</div>
            </div>
            
            <div v-for="period in periods" :key="`${day.date}-${period}`" 
                 class="lesson-slot"
                 @click="openLesson(day.date, period)">
              <div v-if="getLessonForSlot(day.date, period)" 
                   class="lesson-card"
                   :style="`background: ${getLessonForSlot(day.date, period).class_color}15; border-left-color: ${getLessonForSlot(day.date, period).class_color}`">
                <div class="lesson-title">{{ getLessonForSlot(day.date, period).class_name }}</div>
                <div v-if="getLessonForSlot(day.date, period).topic" class="lesson-topic">
                  {{ getLessonForSlot(day.date, period).topic }}
                </div>
                <div class="lesson-badges">
                  <span v-if="getLessonForSlot(day.date, period).homework" class="badge homework">📝</span>
                  <span v-if="getLessonForSlot(day.date, period).resources" class="badge resources">📎</span>
                </div>
              </div>
              <div v-else class="empty-slot">
                <span class="add-icon">+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lesson Modal (Notion-style) -->
      <div v-if="showLessonModal" class="modal-backdrop" @click.self="closeLessonModal">
        <div class="modal-content">
          <header class="modal-header">
            <h2>{{ selectedLesson ? 'Edit Lesson' : 'Add Lesson' }}</h2>
            <button @click="closeLessonModal" class="close-btn">×</button>
          </header>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Class</label>
              <select v-model="lessonForm.class_id" class="form-input">
                <option value="">Select a class</option>
                <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                  {{ cls.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Topic</label>
              <input v-model="lessonForm.topic" 
                     placeholder="What will you teach?"
                     class="form-input">
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea v-model="lessonForm.notes" 
                       placeholder="Lesson notes..."
                       rows="4"
                       class="form-input"></textarea>
            </div>

            <div class="form-group">
              <label>Homework</label>
              <textarea v-model="lessonForm.homework" 
                       placeholder="Homework assignments..."
                       rows="3"
                       class="form-input"></textarea>
            </div>

            <div class="form-group">
              <label>Resources</label>
              <input v-model="lessonForm.resources" 
                     placeholder="Links, materials, etc."
                     class="form-input">
            </div>
          </div>

          <footer class="modal-footer">
            <button @click="closeLessonModal" class="btn-secondary">Cancel</button>
            <button @click="saveLesson" class="btn-primary">
              {{ selectedLesson ? 'Update' : 'Create' }} Lesson
            </button>
          </footer>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import AppLayout from '../components/AppLayout.vue'

const currentWeek = ref(dayjs().startOf('week'))
const lessons = ref([])
const classes = ref([])
const showLessonModal = ref(false)
const selectedLesson = ref(null)
const lessonForm = ref({
  class_id: '',
  date: '',
  period: null,
  topic: '',
  notes: '',
  homework: '',
  resources: ''
})

// You can customize these based on your school schedule
const periods = [1, 2, 3, 4, 5, 6]

const periodTimes = {
  1: '9:00 - 9:50',
  2: '10:00 - 10:50',
  3: '11:00 - 11:50',
  4: '12:40 - 1:30',
  5: '1:40 - 2:30',
  6: '2:40 - 3:30'
}

function getPeriodTime(period) {
  return periodTimes[period] || ''
}

const weekDays = computed(() => {
  const days = []
  for (let i = 1; i <= 5; i++) {
    const date = currentWeek.value.add(i, 'day')
    days.push({
      name: date.format('ddd'),
      dayNum: date.format('D'),
      date: date.format('YYYY-MM-DD')
    })
  }
  return days
})

const currentWeekDisplay = computed(() => {
  const start = currentWeek.value.add(1, 'day')
  const end = currentWeek.value.add(5, 'day')
  return `${start.format('MMMM D')} - ${end.format('MMMM D, YYYY')}`
})

function isToday(date) {
  return date === dayjs().format('YYYY-MM-DD')
}

onMounted(async () => {
  await fetchClasses()
  await fetchLessons()
})

async function fetchClasses() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('classes')
    .select('*')
    .eq('user_id', user.id)
  
  classes.value = data || []
}

async function fetchLessons() {
  const startDate = currentWeek.value.add(1, 'day').format('YYYY-MM-DD')
  const endDate = currentWeek.value.add(5, 'day').format('YYYY-MM-DD')
  
  const { data } = await supabase
    .from('lessons_with_details')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
  
  lessons.value = data || []
}

function getLessonForSlot(date, period) {
  return lessons.value.find(l => l.date === date && l.period === period)
}

function openLesson(date, period) {
  const existingLesson = getLessonForSlot(date, period)
  
  if (existingLesson) {
    selectedLesson.value = existingLesson
    lessonForm.value = { ...existingLesson }
  } else {
    selectedLesson.value = null
    lessonForm.value = {
      class_id: '',
      date: date,
      period: period,
      topic: '',
      notes: '',
      homework: '',
      resources: ''
    }
  }
  
  showLessonModal.value = true
}

async function saveLesson() {
  if (!lessonForm.value.class_id) {
    alert('Please select a class')
    return
  }

  if (selectedLesson.value) {
    await supabase
      .from('lessons')
      .update({
        topic: lessonForm.value.topic,
        notes: lessonForm.value.notes,
        homework: lessonForm.value.homework,
        resources: lessonForm.value.resources
      })
      .eq('id', selectedLesson.value.id)
  } else {
    await supabase
      .from('lessons')
      .insert(lessonForm.value)
  }
  
  await fetchLessons()
  closeLessonModal()
}

function closeLessonModal() {
  showLessonModal.value = false
  selectedLesson.value = null
  lessonForm.value = {
    class_id: '',
    date: '',
    period: null,
    topic: '',
    notes: '',
    homework: '',
    resources: ''
  }
}

function previousWeek() {
  currentWeek.value = currentWeek.value.subtract(1, 'week')
  fetchLessons()
}

function nextWeek() {
  currentWeek.value = currentWeek.value.add(1, 'week')
  fetchLessons()
}

function goToToday() {
  currentWeek.value = dayjs().startOf('week')
  fetchLessons()
}
</script>

<style scoped>
.timetable-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.timetable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.week-info {
  font-size: 16px;
  color: var(--text-secondary);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-today {
  padding: 6px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-today:hover {
  background: var(--hover-bg);
}

.week-nav {
  display: flex;
  gap: 4px;
}

.week-nav-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.week-nav-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.timetable-grid {
  flex: 1;
  overflow: auto;
  background: var(--bg-secondary);
}

.grid-container {
  display: flex;
  min-height: 100%;
}

.time-column {
  width: 100px;
  flex-shrink: 0;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
}

.day-column {
  flex: 1;
  min-width: 180px;
  border-right: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.day-column:last-child {
  border-right: none;
}

.day-header {
  height: 60px;
  padding: 12px;
  border-bottom: 2px solid var(--border-color);
  text-align: center;
  background: var(--bg-primary);
}

.day-header.today {
  background: #e8f4fd;
}

.day-header.today .day-date {
  background: #0084ff;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.day-name {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.day-date {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
}

.time-slot {
  height: 100px;
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.period-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.time-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

.lesson-slot {
  height: 100px;
  border-bottom: 1px solid var(--border-color);
  padding: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.lesson-slot:hover {
  background: var(--hover-bg);
}

.lesson-card {
  height: 100%;
  padding: 10px;
  border-left: 3px solid;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.lesson-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.lesson-topic {
  font-size: 12px;
  color: var(--text-secondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.lesson-badges {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.badge {
  font-size: 12px;
}

.empty-slot {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.lesson-slot:hover .empty-slot {
  opacity: 1;
}

.add-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px dashed var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 18px;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--selection-bg);
  box-shadow: 0 0 0 2px rgba(70, 166, 255, 0.2);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary {
  padding: 8px 16px;
  background: #0084ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #0073e6;
}

.btn-secondary {
  padding: 8px 16px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}
</style>