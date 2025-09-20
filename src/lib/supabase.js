import { createClient } from '@supabase/supabase-js'

// Get these from your Supabase project settings
// Settings → API → Project URL and anon key
const supabaseUrl = 'https://wlszqshemyvrjjbeilay.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc3pxc2hlbXl2cmpqYmVpbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzExODYsImV4cCI6MjA3Mzk0NzE4Nn0.pezUh4zkdUyvdm8aNkr53uM1Fl2sOLgT-1XshxeAQLc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)