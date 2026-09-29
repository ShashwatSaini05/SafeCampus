import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from './supabaseClient';

interface AuthState {
  anonymousId: string | null;
  email: string | null;
  isVerified: boolean;
  authLoading: boolean;
  setAuth: (anonymousId: string, email: string) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      anonymousId: null,
      email: null,
      isVerified: false,
      authLoading: true,
      
      setAuth: (anonymousId, email) => {
        set({ anonymousId, email, isVerified: true, authLoading: false });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ anonymousId: null, email: null, isVerified: false, authLoading: false });
      },

      checkSession: async () => {
        try {
          const { data } = await supabase.auth.getSession();
          const session = data?.session;
          if (session && session.user) {
            // If we have a session but no anonymousId yet, try to fetch it
            if (!get().anonymousId) {
              const { data: userData } = await supabase
                .from('users')
                .select('anonymous_id')
                .eq('id', session.user.id)
                .single();
              
              if (userData?.anonymous_id) {
                set({ anonymousId: userData.anonymous_id, email: session.user.email, isVerified: true });
              } else {
                // fallback if table empty or RLS blocked
                const fallbackAnonId = 'anon_' + Math.random().toString(36).substring(2, 10);
                // attempt to insert
                await supabase.from('users').insert({
                  id: session.user.id,
                  email: session.user.email,
                  anonymous_id: fallbackAnonId
                }).select();
                
                set({ anonymousId: fallbackAnonId, email: session.user.email, isVerified: true });
              }
            } else {
              set({ isVerified: true, email: session.user.email });
            }
          } else {
            set({ anonymousId: null, email: null, isVerified: false });
          }
        } catch {
          // Gracefully catch fetch errors if Supabase URL is unreachable or invalid
          set({ anonymousId: null, email: null, isVerified: false });
        } finally {
          set({ authLoading: false });
        }
      }
    }),
    {
      name: 'safecampus-auth-store',
      // DO NOT put Next.js localStorage wrapper directly if createJSONStorage can handle it
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        anonymousId: state.anonymousId,
        email: state.email,
        isVerified: state.isVerified,
      }),
    }
  )
);

// Report types
export interface Report {
  id: string;
  tracking_id?: string;
  category: 'ragging' | 'harassment' | 'safety' | 'other';
  description: string;
  location?: string;
  status: 'Pending' | 'Under Review' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  anonymous_id: string;
  created_at: string;
}

export interface Analytics {
  total: number;
  byStatus: { Pending: number; 'Under Review': number; Resolved: number };
  byCategory: { ragging: number; harassment: number; safety: number; other: number };
  byPriority: { High: number; Medium: number; Low: number };
  trend: { date: string; count: number }[];
}

