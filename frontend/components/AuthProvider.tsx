'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, logout } = useAuthStore();

  useEffect(() => {
    // Initial check on load
    checkSession();

    let subscription: any = null;
    try {
      const res = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_IN') {
          await checkSession();
        } else if (event === 'SIGNED_OUT') {
          logout();
        }
      });
      subscription = res?.data?.subscription;
    } catch {
      // Ignore auth listener error if Supabase URL is invalid
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [checkSession, logout]);

  return <>{children}</>;
}
