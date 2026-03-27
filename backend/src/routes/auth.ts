import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';
import { sendOTPEmail } from '../lib/mailer';

const router = Router();

const ALLOWED_DOMAIN = '@coeruniversity.ac.in';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateAnonymousId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'User-';
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email().toLowerCase(),
    });

    const { email } = schema.parse(req.body);

    if (!email.endsWith(ALLOWED_DOMAIN)) {
      res.status(400).json({
        error: `Only ${ALLOWED_DOMAIN} emails are allowed on SafeCampus.`,
      });
      return;
    }

    // Invalidate any existing OTPs for this email
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const { error } = await supabase.from('otp_codes').insert({
      id: uuidv4(),
      email,
      code: otp,
      expires_at: expiresAt.toISOString(),
      used: false,
    });

    if (error) throw error;

    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent successfully', email });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid email address' });
      return;
    }
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email().toLowerCase(),
      otp: z.string().length(6),
    });

    const { email, otp } = schema.parse(req.body);

    if (!email.endsWith(ALLOWED_DOMAIN)) {
      res.status(400).json({ error: `Only ${ALLOWED_DOMAIN} emails are allowed.` });
      return;
    }

    // Find valid OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' });
      return;
    }

    // Mark OTP as used
    await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id);

    // Check if user exists
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      // Create new user
      const anonymousId = generateAnonymousId();
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: uuidv4(),
          email,
          is_verified: true,
          anonymous_id: anonymousId,
        })
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    } else if (!user.is_verified) {
      await supabase.from('users').update({ is_verified: true }).eq('id', user.id);
      user.is_verified = true;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, anonymousId: user.anonymous_id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Verification successful',
      token,
      anonymousId: user.anonymous_id,
      isVerified: true,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/auth/check-domain
router.post('/check-domain', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }
  const valid = typeof email === 'string' && email.toLowerCase().endsWith(ALLOWED_DOMAIN);
  res.json({ valid, domain: ALLOWED_DOMAIN });
});

export default router;
