import { Resend } from 'resend';
import { nanoid } from 'nanoid';

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
      subject: `Your verification code for ${appName}`,
      replyTo: process.env.SUPPORT_EMAIL || fromEmail,
      headers: {
        'X-Entity-Ref-ID': nanoid(),
      },
      tags: [
        {
          name: 'category',
          value: 'verification',
        },
      ],
      text: `Sign in to ${appName}\n\nEnter the following code to complete your sign in:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Sign in to ${appName}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="background-color: #f9fafb; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #333;">
            <!-- user verification code -->
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="font-size: 24px; font-weight: bold; color: #4F46E5; text-decoration: none;">✨ ${appName}</a>
              </div>
              <div style="background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; text-align: center;">
                <h1 style="margin-top: 0; font-size: 24px; color: #111827; margin-bottom: 16px;">Sign in to your account</h1>
                <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">Enter the following code to complete your sign in:</p>
                
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827; background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0; display: inline-block;">${code}</div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This code will expire in 10 minutes.</p>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email.</p>
              </div>
              <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280;">
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
