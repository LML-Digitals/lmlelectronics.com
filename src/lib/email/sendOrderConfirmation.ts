"use server";

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error("RESEND_API_KEY is not set");
}
const resend = new Resend(apiKey);

const BRAND_COLOR = "#d6cd00";

export async function sendOrderConfirmationEmail({
  to,
  orderId,
  customerName,
  orderDetailsHtml,
}: {
  to: string;
  orderId: string;
  customerName: string;
  orderDetailsHtml: string;
}) {
  return resend.emails.send({
    from: "orders@lmlrepair.com", // You must verify this sender in Resend
    to,
    subject: `Order Confirmation - #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 32px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(30,64,175,0.08);">
          <div style="background: ${BRAND_COLOR}; color: #fff; padding: 24px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 2rem; letter-spacing: 1px;">LML Electronics</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">Thank you for your order, ${customerName}!</h2>
            <p style="font-size: 1.1rem; color: #222;">Your order <b>#${orderId}</b> has been received and is being processed.</p>
            <div style="margin: 32px 0;">
              ${orderDetailsHtml}
            </div>
            <p style="color: #555;">We appreciate your business! If you have any questions, just reply to this email.</p>
            <div style="margin-top: 40px; text-align: center;">
              <a href="https://lmlelectronics.com/orders/${orderId}" style="display: inline-block; background: ${BRAND_COLOR}; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Your Order</a>
            </div>
          </div>
          <div style="background: #f1f5f9; color: #888; text-align: center; padding: 16px; font-size: 0.95rem;">
            &copy; ${new Date().getFullYear()} LML Electronics. All rights reserved.
          </div>
        </div>
      </div>
    `,
  });
}
