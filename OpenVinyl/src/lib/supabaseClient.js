import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://mgyftmhpdafhuuvvgebv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neWZ0bWhwZGFmaHV1dnZnZWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MjY0NzAsImV4cCI6MjA0MjEwMjQ3MH0.n_pNbRHRpSb27FFwxf-ijtM0p1svXX0FOHcC_2smJEk')