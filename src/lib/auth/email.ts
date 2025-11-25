import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const appName = process.env.NEXT_PUBLIC_APP_NAME || 'PromptForge';

export async function sendVerificationEmail(email: string, code: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.');
        console.log(`[DEV MODE] Verification code for ${email}: ${code}`);
        return { success: true, devMode: true };
    }

    try {
        const data = await resend.emails.send({
            from: `${appName} <${fromEmail}>`,
            to: email,
            subject: `Sign in to ${appName}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Sign in to ${appName}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #4F46E5; text-decoration: none; }
              .content { background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; text-align: center; }
              .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827; background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0; display: inline-block; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
              .expiry { color: #6b7280; font-size: 14px; margin-top: 20px; }
            </style>
          </head>
          <body style="background-color: #f9fafb; margin: 0;">
            <div class="container">
              <div class="header">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="logo">✨ ${appName}</a>
              </div>
              <div class="content">
                <h1 style="margin-top: 0; font-size: 24px; color: #111827;">Sign in to your account</h1>
                <p style="font-size: 16px; color: #4b5563;">Enter the following code to complete your sign in:</p>
                
                <div class="code">${code}</div>
                
                <p class="expiry">This code will expire in 10 minutes.</p>
                <p style="font-size: 14px; color: #6b7280;">If you didn't request this code, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}
