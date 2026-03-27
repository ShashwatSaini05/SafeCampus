import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: `"SafeCampus 🛡️" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your SafeCampus Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f1a; margin: 0; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2d2d4e; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; }
            .logo { font-size: 28px; font-weight: 800; color: white; letter-spacing: -1px; }
            .tagline { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 4px; }
            .body { padding: 40px 32px; }
            .greeting { color: #e2e8f0; font-size: 16px; margin-bottom: 8px; }
            .message { color: #94a3b8; font-size: 14px; line-height: 1.6; }
            .otp-box { background: linear-gradient(135deg, #1e1e3a, #16213e); border: 2px solid #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; }
            .otp-label { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
            .otp-code { font-size: 42px; font-weight: 800; color: #6366f1; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .expiry { color: #f87171; font-size: 13px; margin-top: 12px; }
            .footer { background: #111122; padding: 20px 32px; text-align: center; color: #475569; font-size: 12px; border-top: 1px solid #2d2d4e; }
            .warning { color: #fbbf24; font-size: 12px; margin-top: 16px; padding: 12px; background: rgba(251,191,36,0.1); border-radius: 8px; border: 1px solid rgba(251,191,36,0.2); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🛡️ SafeCampus</div>
              <div class="tagline">Your anonymous safety platform</div>
            </div>
            <div class="body">
              <div class="greeting">Verify your identity</div>
              <div class="message">
                You requested access to SafeCampus. Use the verification code below to complete your login. Your anonymity is fully protected.
              </div>
              <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="expiry">⏱ Expires in 10 minutes</div>
              </div>
              <div class="warning">
                🔒 Never share this code. SafeCampus will never ask for your OTP. Your identity remains completely anonymous on our platform.
              </div>
            </div>
            <div class="footer">
              SafeCampus © 2024 · COER University · Anonymous Safety Platform<br>
              If you did not request this, please ignore this email.
            </div>
          </div>
        </body>
      </html>
    `,
  };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // Dev mode: log OTP to console
    console.log(`\n📧 [DEV MODE] OTP for ${email}: ${otp}\n`);
    return;
  }

  await transporter.sendMail(mailOptions);
}
