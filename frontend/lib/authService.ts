import { supabase } from './supabaseClient';

export const authService = {
  /**
   * Send a magic link to the user's email.
   * @param email The user's email address
   * @param redirectTo The URL to redirect to after clicking the magic link
   */
  async sendMagicLink(email: string, redirectTo: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        // we use shouldCreateUser: true by default in supabase usually, 
        // but no OTP so we don't need any other config
      },
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Logout the current user
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current active session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }
};