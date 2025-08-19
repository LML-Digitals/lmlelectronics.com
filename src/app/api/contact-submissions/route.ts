import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST (req: NextRequest) {
  try {
    const data = await req.json();
    const { firstName, lastName, email, subject, message } = data;

    // Basic validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    // Create contact submission in database
    const submission = await prisma.contactSubmission.create({
      data: {
        firstName,
        lastName,
        email,
        subject,
        message,
        status: 'UNREAD',
      },
    });

    // Send email notification
    try {
      await resend.emails.send({
        from: 'LML Electronics <noreply@lmlelectronics.com>',
        to: ['support@lmlelectronics.com'],
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
        `,
      });
    } catch (_emailError) {
      // Failed to send email notification - don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Contact form submitted successfully',
        submissionId: submission.id,
      },
      { status: 201 },
    );
  } catch (error) {
    // Error processing contact form

    return NextResponse.json(
      {
        error: 'Failed to process contact form',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
