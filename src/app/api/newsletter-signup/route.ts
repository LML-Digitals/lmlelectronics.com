import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
// Simple hash function to replace bcryptjs
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}
import { v4 as uuidv4 } from "uuid";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      if (!existingCustomer.newsletterSubscribed) {
        // Update existing customer to subscribe
        await prisma.customer.update({
          where: { email },
          data: { newsletterSubscribed: true },
        });
      }
      return NextResponse.json(
        { 
          success: true, 
          message: "You're already subscribed to our newsletter!",
          isExisting: true
        },
        { status: 200 }
      );
    }

    // Generate a unique discount code
    const discountCode = `WELCOME${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create a random password for new customer
    const plainPassword = uuidv4().substring(0, 8);
    const hashedPassword = simpleHash(plainPassword);

    // Create new customer with newsletter subscription
    const customer = await prisma.customer.create({
      data: {
        email,
        firstName: "",
        lastName: "",
        password: hashedPassword,
        newsletterSubscribed: true,
        isActive: true,
      },
    });

    // Send welcome email with discount code
    try {
      if (resend) {
        await resend.emails.send({
        from: "LML Electronics <noreply@lmlelectronics.com>",
        to: [email],
        subject: "Welcome to LML Electronics Newsletter! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to LML Electronics!</h1>
            <p>Thank you for subscribing to our newsletter! You'll be the first to know about:</p>
            <ul>
              <li>🎯 Exclusive deals and discounts</li>
              <li>🔧 DIY repair tips and guides</li>
              <li>📱 New product releases</li>
              <li>⚡ Flash sales and promotions</li>
            </ul>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #28a745; margin-top: 0;">🎁 Your Welcome Gift</h2>
              <p>Use this exclusive discount code on your first order:</p>
              <div style="background-color: #28a745; color: white; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; letter-spacing: 2px;">
                ${discountCode}
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">
                *Valid for 30 days on orders over $25
              </p>
            </div>
            
            <p>Happy repairing!</p>
            <p><strong>The LML Electronics Team</strong></p>
            
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              You can unsubscribe at any time by clicking the link in our emails.
            </p>
          </div>
        `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Successfully subscribed to newsletter!",
        discountCode: discountCode,
        customerId: customer.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Failed to sign up for newsletter" },
      { status: 500 }
    );
  }
}
