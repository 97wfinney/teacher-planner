<template>
  <AppLayout>
    <div class="settings-container">
      <header class="settings-header">
        <h1 class="page-title">School Settings</h1>
      </header>

      <div class="settings-content">
        <!-- Timetable Type -->
        <section class="settings-section">
          <h2 class="section-title">Timetable Structure</h2>
          <div class="setting-group">
            <label class="setting-label">Timetable Type</label>
            <select v-model="timetableType" @change="saveTimetableType" class="form-input">
              <option value="single">Single Week Timetable</option>
              <option value="two-week">Two Week Timetable (Week A/B)</option>
            </select>
          </div>
        </section>

        <!-- Term Dates -->
        <section class="settings-section">
          <h2 class="section-title">Term Dates</h2>
          <button @click="showAddTerm = true" class="btn-primary mb-4">
            Add Term
          </button>

          <div class="terms-grid">
            <div v-for="term in terms" :key="term.id" class="term-card">
              <h3 class="term-name">{{ term.name }}</h3>
              <div class="term-dates">
                {{ formatDate(term.start_date) }} - {{ formatDate(term.end_date) }}
              </div>
              <div v-if="term.half_term_start" class="half-term">
                Half term: {{ formatDate(term.half_term_start) }} - {{ formatDate(term.half_term_end) }}
              </div>
              <button @click="deleteTerm(term.id)" class="btn-delete">Delete</button>
            </div>
          </div>
        </section>

        <!-- Class Patterns -->
        <section class="settings-section">
          <h2 class="section-title">Class Timetables</h2>
          <div class="setting-group">
            <label class="setting-label">Configure Regular Lessons</label>
            <select v-model="selectedClassForPattern" class="form-input">
              <option value="">Select a class to configure</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div v-if="selectedClassForPattern" class="pattern-grid">
            <h3 class="pattern-title">Regular Lesson Times</h3>
            
            <!-- Week selector for two-week timetable -->
            <div v-if="timetableType === 'two-week'" class="week-tabs">
              <button 
                @click="selectedWeek = 1" 
                :class="['week-tab', { active: selectedWeek === 1 }]">
                Week A
              </button>
              <button 
                @click="selectedWeek = 2" 
                :class="['week-tab', { active: selectedWeek === 2 }]">
                Week B
              </button>
            </div>

            <table class="pattern-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th v-for="day in weekDays" :key="day.value">{{ day.name }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="period in periods" :key="period">
                  <td class="period-cell">{{ period }}</td>
                  <td v-for="day in weekDays" :key="`${day.value}-${period}`">
                    <input
                      type="checkbox"
                      :checked="hasPattern(day.value, period)"
                      @change="togglePattern(day.value, period)"
                      class="pattern-checkbox"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <button @click="generateLessons" class="btn-primary mt-4">
              Generate Lessons for Term
            </button>
          </div>
        </section>

        <!-- Add Term Modal -->
        <div v-if="showAddTerm" class="modal-backdrop" @click.self="showAddTerm = false">
          <div class="modal-content">
            <header class="modal-header">
              <h2>Add Term</h2>
              <button @click="showAddTerm = false" class="close-btn">×</button>
            </header>
            
            <div class="modal-body">
              <div class="form-group">
                <label>Term Name</label>
                <input v-model="newTerm.name" 
                       placeholder="e.g., Autumn Term 2024"
                       class="form-input">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Start Date</label>
                  <input v-model="newTerm.start_date" 
                         type="date"
                         class="form-input">
                </div>
                <div class="form-group">
                  <label>End Date</label>
                  <input v-model="newTerm.end_date" 
                         type="date"
                         class="form-input">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Half Term Start (Optional)</label>
                  <input v-model="newTerm.half_term_start" 
                         type="date"
                         class="form-input">
                </div>
                <div class="form-group">
                  <label>Half Term End (Optional)</label>
                  <input v-model="newTerm.half_term_end" 
                         type="date"
                         class="form-input">
                </div>
              </div>
            </div>

            <footer class="modal-footer">
              <button @click="showAddTerm = false" class="btn-secondary">Cancel</button>
              <button @click="addTerm" class="btn-primary">Add Term</button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import AppLayout from '../components/AppLayout.vue'

const timetableType = ref('single')
const terms = ref([])
const classes = ref([])
const selectedClassForPattern = ref('')
const patterns = ref([])
const selectedWeek = ref(1)
const showAddTerm = ref(false)
const newTerm = ref({
  name: '',
  start_date: '',
  end_date: '',
  half_term_start: '',
  half_term_end: ''
})

const periods = [1, 2, 3, 4, 5, 6]
const weekDays = [
  { name: 'Monday', value: 1 },
  { name: 'Tuesday', value: 2 },
  { name: 'Wednesday', value: 3 },
  { name: 'Thursday', value: 4 },
  { name: 'Friday', value: 5 }
]

onMounted(async () => {
  await fetchTerms()
  await fetchClasses()
  await fetchTimetableType()
})

watch(selectedClassForPattern, async (newVal) => {
  if (newVal) {
    await fetchPatterns(newVal)
  }
})

async function fetchTimetableType() {
  const { data } = await supabase
    .from('terms')
    .select('timetable_type')
    .limit(1)
    .single()
  
  if (data) {
    timetableType.value = data.timetable_type || 'single'
  }
}

async function saveTimetableType() {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Update all terms for this user
  await supabase
    .from('terms')
    .update({ timetable_type: timetableType.value })
    .eq('user_id', user.id)
}

async function fetchTerms() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data } = await supabase
    .from('terms')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date')
  
  terms.value = data || []
}

async function fetchClasses() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data } = await supabase
    .from('classes')
    .select('*')
    .eq('user_id', user.id)
    .order('name')
  
  classes.value = data || []
}

async function fetchPatterns(classId) {
  const { data } = await supabase
    .from('lesson_patterns')
    .select('*')
    .eq('class_id', classId)
  
  patterns.value = data || []
}

function hasPattern(dayOfWeek, period) {
  return patterns.value.some(p => 
    p.day_of_week === dayOfWeek && 
    p.period === period &&
    (timetableType.value === 'single' || p.week_number === selectedWeek.value)
  )
}

async function togglePattern(dayOfWeek, period) {
  const existingPattern = patterns.value.find(p => 
    p.day_of_week === dayOfWeek && 
    p.period === period &&
    (timetableType.value === 'single' || p.week_number === selectedWeek.value)
  )

  if (existingPattern) {
    // Remove pattern
    await supabase
      .from('lesson_patterns')
      .delete()
      .eq('id', existingPattern.id)
  } else {
    // Add pattern
    await supabase
      .from('lesson_patterns')
      .insert({
        class_id: selectedClassForPattern.value,
        day_of_week: dayOfWeek,
        period: period,
        week_number: timetableType.value === 'two-week' ? selectedWeek.value : 1
      })
  }
  
  await fetchPatterns(selectedClassForPattern.value)
}

async function generateLessons() {
  if (!selectedClassForPattern.value) {
    alert('Please select a class')
    return
  }

  const termId = prompt('Which term? (1 for first term in list, 2 for second, etc.)')
  const term = terms.value[termId - 1]
  
  if (!term) {
    alert('Invalid term selection')
    return
  }

  // Call the database function to generate lessons
  const { error } = await supabase
    .rpc('generate_lessons_from_patterns', {
      p_class_id: selectedClassForPattern.value,
      p_start_date: term.start_date,
      p_end_date: term.end_date,
      p_timetable_type: timetableType.value
    })

  if (error) {
    alert('Error generating lessons: ' + error.message)
  } else {
    alert('Lessons generated successfully!')
  }
}

async function addTerm() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase
    .from('terms')
    .insert({
      user_id: user.id,
      ...newTerm.value,
      timetable_type: timetableType.value
    })
  
  if (!error) {
    await fetchTerms()
    showAddTerm.value = false
    newTerm.value = {
      name: '',
      start_date: '',
      end_date: '',
      half_term_start: '',
      half_term_end: ''
    }
  }
}

async function deleteTerm(termId) {
  if (confirm('Are you sure you want to delete this term?')) {
    await supabase
      .from('terms')
      .delete()
      .eq('id', termId)
    
    await fetchTerms()
  }
}

function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY')
}
</script>

<style scoped>
.settings-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.settings-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.terms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.term-card {
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.term-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.term-dates {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.half-term {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

.pattern-grid {
  margin-top: 20px;
}

.pattern-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.week-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.week-tab {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.week-tab.active {
  background: var(--selection-bg);
  color: white;
  border-color: var(--selection-bg);
}

.pattern-table {
  width: 100%;
  border-collapse: collapse;
}

.pattern-table th,
.pattern-table td {
  padding: 8px;
  text-align: center;
  border: 1px solid var(--border-color);
}

.pattern-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  font-size: 14px;
}

.period-cell {
  background: var(--bg-secondary);
  font-weight: 600;
}

.pattern-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn-delete {
  margin-top: 12px;
  padding: 4px 8px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.btn-delete:hover {
  background: #dd3333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>