import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email/emailService";
import { z } from "zod";

// Validation schema for contact form data
const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = contactFormSchema.parse(body);

    // Send the contact form email
    const success = await emailService.sendContactFormEmail(validatedData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send contact form email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Contact form submitted successfully. We'll get back to you soon!" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid form data", 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
