<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="workspace">
          <div class="workspace-icon">📚</div>
          <h2 class="workspace-name">Teacher Planner</h2>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" active-class="active">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Dashboard</span>
        </router-link>
        <router-link to="/timetable" class="nav-item" active-class="active">
          <span class="nav-icon">📅</span>
          <span class="nav-text">Timetable</span>
        </router-link>
        <router-link to="/classes" class="nav-item" active-class="active">
          <span class="nav-icon">👥</span>
          <span class="nav-text">Classes</span>
        </router-link>
        <router-link to="/tasks" class="nav-item" active-class="active">
          <span class="nav-icon">✅</span>
          <span class="nav-text">Tasks</span>
        </router-link>
        <router-link to="/settings" class="nav-item" active-class="active">
        <span class="nav-icon">⚙️</span>
        <span class="nav-text">Settings</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-section">
          <div class="user-info">
            <span class="user-email">{{ userEmail }}</span>
          </div>
          <button @click="signOut" class="sign-out-btn">
            Sign Out
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const userEmail = ref('')

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    userEmail.value = user.email
  }
})

async function signOut() {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
}

.sidebar {
  width: 240px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
}

.workspace {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.workspace:hover {
  background: var(--hover-bg);
}

.workspace-icon {
  font-size: 20px;
}

.workspace-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  font-size: 14px;
}

.nav-item:hover {
  background: var(--hover-bg);
}

.nav-item.active {
  background: var(--hover-bg);
  color: var(--text-primary);
  font-weight: 500;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 12px 14px;
  border-top: 1px solid var(--border-color);
}

.user-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-email {
  font-size: 12px;
  color: var(--text-tertiary);
}

.sign-out-btn {
  padding: 4px 8px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.sign-out-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  overflow: auto;
  background: var(--bg-primary);
}
</style>