<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'

const router = useRouter()

onMounted(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      router.push('/login')
    }
  })
})
</script>

<style>
/* Notion-like base styles */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f7f6f3;
  --bg-sidebar: #fbfbfa;
  --text-primary: #37352f;
  --text-secondary: #787774;
  --text-tertiary: #9b9a97;
  --border-color: #e9e9e7;
  --hover-bg: rgba(55, 53, 47, 0.08);
  --selection-bg: #46a6ff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  color: var(--text-primary);
  background: var(--bg-primary);
  line-height: 1.5;
  font-size: 14px;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>