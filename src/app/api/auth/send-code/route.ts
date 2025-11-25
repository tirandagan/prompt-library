import { NextResponse } from 'next/server';
import { generateVerificationCode } from '@/lib/auth/generateCode';
import { sendVerificationEmail } from '@/lib/auth/email';
import { createVerificationCode } from '@/db/auth-queries';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        // Generate code
        const code = generateVerificationCode();

        // Save to database
        await createVerificationCode(email, code);

        // Send email
        const emailResult = await sendVerificationEmail(email, code);

        if (!emailResult.success) {
            return NextResponse.json(
                { success: false, message: 'Failed to send verification email' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Verification code sent',
            devMode: emailResult.devMode, // Only present if RESEND_API_KEY is missing
        });
    } catch (error) {
        console.error('Send code error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
