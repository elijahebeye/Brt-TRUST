// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Directly inserting your Supabase credentials
const supabaseUrl = 'https://qumzqhdaoxphtfkxebau.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bXpxaGRhb3hwaHRma3hlYmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTEwNjEsImV4cCI6MjA3MTY4NzA2MX0.7Kb5iWh-pDhrHwLdqmtPadYkskBl8PhYDV2_q_SNfqU'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
