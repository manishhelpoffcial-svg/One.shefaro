import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ktcreupdzhsnvtgxahzn.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y3JldXBkemhzbnZ0Z3hhaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTE3NjQsImV4cCI6MjA5ODYyNzc2NH0.mG4blUogBPuzd8n6xLUu7zvHH2VEX1AVfV7PI-Sr65I';
const SUPABASE_SERVICE_ROLE_KEY = (import.meta as any).env?.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y3JldXBkemhzbnZ0Z3hhaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA1MTc2NCwiZXhwIjoyMDk4NjI3NzY0fQ.BF4AltVn-IKYZGOpKRGPq2R3aurGeDKAzCgHtcgoJFs';

// Standard public client using the Anon key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Admin client using the Service Role key for privileged operations
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
