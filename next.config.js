/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://bbloahmpkwutqhoijvhs.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibG9haG1wa3d1dHFob2lqdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjg1MDcsImV4cCI6MjA4MzgwNDUwN30.Y2eavchHOBTrovESxYo_KCfpV-OCREFQZRNQhVCRuyA',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibG9haG1wa3d1dHFob2lqdmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIyODUwNywiZXhwIjoyMDgzODA0NTA3fQ.-C_yYjj_ux97u4__bSr9FXL_hSKzTjlP8-tnu0Rom2M',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
};

module.exports = nextConfig;