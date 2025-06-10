import { NextRequest, NextResponse } from "next/server";
import {
  processWebhookEvent,
  verifyWebhookSignature,
  WebhookEvent,
} from "@/lib/square/webhooks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-square-signature") || "";

    // Get webhook signature key from environment variables
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

    if (!webhookSignatureKey) {
      console.error(
        "Missing SQUARE_WEBHOOK_SIGNATURE_KEY environment variable"
      );
      return NextResponse.json(
        { error: "Webhook signature key not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, webhookSignatureKey)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook event
    let event: WebhookEvent;
    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error("Invalid webhook payload:", error);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Process the webhook event
    await processWebhookEvent(event);

    // Return success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle webhook subscription verification (GET request)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challenge = searchParams.get("challenge");

    if (challenge) {
      // Return challenge for webhook subscription verification
      return new NextResponse(challenge, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    return NextResponse.json(
      { error: "Challenge parameter is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error handling webhook verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
