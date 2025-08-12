import { Resend } from "resend";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export interface EmailVariables {
  customer_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
  subject?: string;
  message?: string;
  [key: string]: string | undefined;
}

export class EmailService {
  /**
   * Get sender email based on email type
   */
  private getSenderEmail(emailType: 'contact' | 'order' | 'support' = 'contact'): string {
    switch (emailType) {
      case 'contact':
        return "contact@lmlrepair.com";
      case 'order':
        return "orders@lmlrepair.com";
      case 'support':
        return "support@lmlrepair.com";
      default:
        return process.env.RESEND_FROM_EMAIL || "contact@lmlrepair.com";
    }
  }

  /**
   * Process template variables in content
   */
  private processTemplate(template: string, variables: EmailVariables): string {
    let processed = template;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      processed = processed.replace(regex, value || "");
    });

    return processed;
  }

  /**
   * Send contact form email
   */
  async sendContactFormEmail(data: ContactFormData): Promise<boolean> {
    try {
      const variables: EmailVariables = {
        customer_name: `${data.firstName} ${data.lastName}`,
        customer_first_name: data.firstName,
        customer_last_name: data.lastName,
        customer_email: data.email,
        subject: data.subject,
        message: data.message,
      };

      // Send to customer (confirmation)
      await this.sendContactConfirmation(data.email, variables);
      
      // Send to admin (notification)
      await this.sendContactNotification(variables);

      // Log the contact submission
      await this.logContactSubmission(data);

      return true;
    } catch (error) {
      console.error("Error sending contact form email:", error);
      return false;
    }
  }

  /**
   * Send confirmation email to customer
   */
  private async sendContactConfirmation(to: string, variables: EmailVariables): Promise<void> {
    const subject = "Thank you for contacting LML Electronics";
    const html = this.processTemplate(this.getContactConfirmationTemplate(), variables);

    await resend.emails.send({
      from: this.getSenderEmail('contact'),
      to,
      subject,
      html,
    });
  }

  /**
   * Send notification email to admin
   */
  private async sendContactNotification(variables: EmailVariables): Promise<void> {
    const subject = `New Contact Form Submission: ${variables.subject}`;
    const html = this.processTemplate(this.getContactNotificationTemplate(), variables);

    await resend.emails.send({
      from: this.getSenderEmail('contact'),
      to: process.env.ADMIN_EMAIL || "lookmanlookrepair@gmail.com",
      subject,
      html,
    });
  }

  /**
   * Log contact submission to database
   */
  private async logContactSubmission(data: ContactFormData): Promise<void> {
    try {
      await prisma.contactSubmission.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          subject: data.subject,
          message: data.message,
          status: "UNREAD",
        },
      });
    } catch (error) {
      console.error("Error logging contact submission:", error);
    }
  }

  /**
   * Contact confirmation email template
   */
  private getContactConfirmationTemplate(): string {
    return `
      <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 32px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #000; color: #fff; padding: 24px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 2rem; letter-spacing: 1px;">LML Electronics</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #000; margin-top: 0;">Thank you for contacting us, {{customer_first_name}}!</h2>
            <p style="font-size: 1.1rem; color: #222;">We've received your message and will get back to you as soon as possible.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #000;">Your Message Details:</h3>
              <p><strong>Subject:</strong> {{subject}}</p>
              <p><strong>Message:</strong></p>
              <p style="background: #fff; padding: 12px; border-radius: 4px; border-left: 4px solid #000;">{{message}}</p>
            </div>
            
            <p style="color: #555;">We typically respond within 24 hours during business days.</p>
            <p style="color: #555;">If you have an urgent matter, please call us at 1-800-LML-ELECTRONICS.</p>
          </div>
          <div style="background: #f1f5f9; color: #888; text-align: center; padding: 16px; font-size: 0.95rem;">
            &copy; ${new Date().getFullYear()} LML Electronics. All rights reserved.
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Contact notification email template for admin
   */
  private getContactNotificationTemplate(): string {
    return `
      <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 32px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #000; color: #fff; padding: 24px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 2rem; letter-spacing: 1px;">New Contact Form Submission</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #000; margin-top: 0;">Contact Details:</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 24px 0;">
              <p><strong>Name:</strong> {{customer_name}}</p>
              <p><strong>Email:</strong> {{customer_email}}</p>
              <p><strong>Subject:</strong> {{subject}}</p>
              <p><strong>Message:</strong></p>
              <p style="background: #fff; padding: 12px; border-radius: 4px; border-left: 4px solid #000;">{{message}}</p>
            </div>
            
            <p style="color: #555;">Please respond to this customer at your earliest convenience.</p>
            <p style="color: #555;">Submitted on: ${new Date().toLocaleString()}</p>
          </div>
          <div style="background: #f1f5f9; color: #888; text-align: center; padding: 16px; font-size: 0.95rem;">
            &copy; ${new Date().getFullYear()} LML Electronics. All rights reserved.
          </div>
        </div>
      </div>
    `;
  }
}

export const emailService = new EmailService();
