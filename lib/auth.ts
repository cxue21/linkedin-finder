import { supabaseClient, supabaseServer } from './supabase';

// Sign up with email and password
export async function signUp(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  });

  if (error) throw error;

  // Create profile record
  if (data.user) {
    await supabaseServer.from('profiles').insert({
      user_id: data.user.id,
      email: data.user.email,
    });
  }

  return data;
}

// Log in with email and password
export async function logIn(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Log out
export async function logOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) return null;
  return data.user;
}
