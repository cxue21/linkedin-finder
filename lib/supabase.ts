import { createClient } from '@supabase/supabase-js';

// TEMPORARY DEBUG - DELETE AFTER FIXING
console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('🔍 Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function getClientUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) return null;
  return data.user;
}
