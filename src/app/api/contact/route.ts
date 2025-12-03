import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, message } = body;

        // In a real application, you would integrate with an email service here
        // like SendGrid, AWS SES, or Resend.
        
        console.log("Contact form submission:", {
            to: "tiran@6footmedia.com", // Configuring as requested
            from: email,
            message: message,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}

