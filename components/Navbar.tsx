'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabaseClient.auth.getUser();
        if (mounted) {
          setUser(user);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              LinkedFind
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex md:gap-8">
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                >
                  Settings
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
