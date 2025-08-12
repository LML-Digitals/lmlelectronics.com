import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email/emailService";

export async function POST(request: NextRequest) {
  try {
    // Test data
    const testData = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      subject: "Test Contact Form",
      message: "This is a test message to verify the contact form is working properly.",
    };

    // Send test email
    const success = await emailService.sendContactFormEmail(testData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send test email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Test email sent successfully!" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
