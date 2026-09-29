import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure user profile / anonymous ID exists
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('anonymous_id')
          .eq('id', user.id)
          .single();

        if (!profile?.anonymous_id) {
          // Generate stable Anonymous ID format e.g. SC-7F4K92
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let anonId = 'SC-';
          for (let i = 0; i < 6; i++) {
            anonId += chars[Math.floor(Math.random() * chars.length)];
          }

          await supabase.from('users').upsert({
            id: user.id,
            email: user.email,
            anonymous_id: anonId,
            is_verified: true,
          });
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return user to auth page with error if verification fails
  return NextResponse.redirect(`${origin}/auth?error=Could+not+authenticate+user`);
}
