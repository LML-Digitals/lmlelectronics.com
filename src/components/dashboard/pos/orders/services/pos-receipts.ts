'use server';

// import { EmailService } from "@/services/emailServices/emailService";

// const emailService = new EmailService();
import { getOrderById } from './pos-orders';
import { revalidatePath } from 'next/cache';

export async function emailReceipt (
  orderId: string,
  customerEmail?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await getOrderById(orderId);

    if (!result.success || !result.data) {
      return { success: false, error: 'Order not found' };
    }

    const order = result.data;
    const emailTo = customerEmail || order.customer.email;

    if (!emailTo) {
      return { success: false, error: 'No email address provided' };
    }

    // Generate receipt HTML
    const receiptHtml = generateReceiptHtml(order);

    // Send email using unified email service
    // const emailResult = await emailService.sendEmail({
    //   to: emailTo,
    //   subject: `Receipt for Order ${order.id
    //     .slice(-8)
    //     .toUpperCase()} - LML Repair`,
    //   content: receiptHtml,
    //   emailType: "TRANSACTIONAL"
    // });

    // if (!emailResult) {
    //   console.error("Email service error");
    //   return { success: false, error: "Failed to send email" };
    // }

    return { success: true };
  } catch (error) {
    console.error('Error sending email receipt:', error);

    return { success: false, error: 'Failed to send email receipt' };
  }
}

export async function printReceipt (orderId: string): Promise<{ success: boolean; error?: string; receiptData?: any }> {
  try {
    const result = await getOrderById(orderId);

    if (!result.success || !result.data) {
      return { success: false, error: 'Order not found' };
    }

    const order = result.data;

    // Generate receipt data for printing
    const receiptData = generateReceiptData(order);

    // In a real implementation, you would send this to a thermal printer
    // For now, we'll return the data so the frontend can handle printing
    return {
      success: true,
      receiptData: {
        ...receiptData,
        printCommand: generateEscPosCommands(order),
      },
    };
  } catch (error) {
    console.error('Error preparing receipt for printing:', error);

    return { success: false, error: 'Failed to prepare receipt for printing' };
  }
}

function generateReceiptHtml (order: any): string {
  const totalRefunded = order.refunds.reduce(
    (sum: number, refund: any) => sum + refund.amount,
    0,
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - Order ${order.id.slice(-8).toUpperCase()}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .location-info {
          font-size: 12px;
          margin-bottom: 2px;
        }
        .order-info {
          margin: 15px 0;
          font-size: 12px;
        }
        .items {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 10px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 12px;
        }
        .item-name {
          flex: 1;
          margin-right: 10px;
        }
        .item-qty {
          margin-right: 10px;
          min-width: 30px;
        }
        .item-price {
          min-width: 60px;
          text-align: right;
        }
        .totals {
          margin-top: 10px;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 12px;
        }
        .final-total {
          font-weight: bold;
          font-size: 14px;
          border-top: 1px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }
        .payment-info {
          margin-top: 15px;
          font-size: 12px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 10px;
          border-top: 1px solid #000;
          padding-top: 10px;
        }
        .refunds {
          margin-top: 10px;
          padding: 10px;
          background: #f5f5f5;
          border: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">LML REPAIR</div>
        <div class="location-info">${order.storeLocation.name}</div>
        <div class="location-info">${order.storeLocation.address}</div>
        <div class="location-info">${order.storeLocation.phone}</div>
      </div>

      <div class="order-info">
        <div><strong>Order #:</strong> ${order.id.slice(-8).toUpperCase()}</div>
        <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
        <div><strong>Customer:</strong> ${order.customer.firstName} ${
  order.customer.lastName
}</div>
        <div><strong>Email:</strong> ${order.customer.email}</div>
        ${
  order.customer.phone
    ? `<div><strong>Phone:</strong> ${order.customer.phone}</div>`
    : ''
}
        <div><strong>Staff:</strong> ${order.staff.firstName} ${
  order.staff.lastName
}</div>
        <div><strong>Status:</strong> ${order.status}</div>
      </div>

      <div class="items">
        <div style="font-weight: bold; margin-bottom: 10px;">ITEMS:</div>
        ${order.items
    .map((item: any) => `
          <div class="item">
            <div class="item-name">${item.description}</div>
            <div class="item-qty">x${item.quantity}</div>
            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `)
    .join('')}
      </div>

      <div class="totals">
        <div class="total-line">
          <span>Subtotal:</span>
          <span>$${order.subtotal.toFixed(2)}</span>
        </div>
        ${
  order.taxAmount > 0
    ? `
          <div class="total-line">
            <span>Tax:</span>
            <span>$${order.taxAmount.toFixed(2)}</span>
          </div>
        `
    : ''
}
        ${
  order.discountAmount > 0
    ? `
          <div class="total-line">
            <span>Discount:</span>
            <span>-$${order.discountAmount.toFixed(2)}</span>
          </div>
        `
    : ''
}
        ${
  order.tipAmount > 0
    ? `
          <div class="total-line">
            <span>Tip:</span>
            <span>$${order.tipAmount.toFixed(2)}</span>
          </div>
        `
    : ''
}
        ${
  order.serviceChargeTotal > 0
    ? `
          <div class="total-line">
            <span>Service Charges:</span>
            <span>$${order.serviceChargeTotal.toFixed(2)}</span>
          </div>
        `
    : ''
}
        <div class="total-line final-total">
          <span>TOTAL:</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div class="payment-info">
        <div><strong>Payment Method:</strong> ${
  order.paymentMethod || 'N/A'
}</div>
        ${
  order.squareTxnId
    ? `<div><strong>Transaction ID:</strong> ${order.squareTxnId}</div>`
    : ''
}
      </div>

      ${
  order.refunds.length > 0
    ? `
        <div class="refunds">
          <div style="font-weight: bold; margin-bottom: 5px;">REFUNDS:</div>
          ${order.refunds
    .map((refund: any) => `
            <div class="total-line">
              <span>${new Date(refund.createdAt).toLocaleDateString()}</span>
              <span>-$${refund.amount.toFixed(2)}</span>
            </div>
          `)
    .join('')}
          <div class="total-line" style="border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
            <span><strong>Net Amount:</strong></span>
            <span><strong>$${(order.total - totalRefunded).toFixed(2)}</strong></span>
          </div>
        </div>
      `
    : ''
}

      <div class="footer">
        <div>Thank you for your business!</div>
        <div>Visit us at lmlrepair.com</div>
        <div>Follow us on social media @lmlrepair</div>
      </div>
    </body>
    </html>
  `;
}

function generateReceiptData (order: any) {
  const totalRefunded = order.refunds.reduce(
    (sum: number, refund: any) => sum + refund.amount,
    0,
  );

  return {
    orderId: order.id.slice(-8).toUpperCase(),
    date: new Date(order.createdAt).toLocaleString(),
    customer: {
      name: `${order.customer.firstName} ${order.customer.lastName}`,
      email: order.customer.email,
      phone: order.customer.phone,
    },
    staff: `${order.staff.firstName} ${order.staff.lastName}`,
    location: {
      name: order.storeLocation.name,
      address: order.storeLocation.address,
      phone: order.storeLocation.phone,
    },
    items: order.items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    })),
    totals: {
      subtotal: order.subtotal,
      tax: order.taxAmount,
      discount: order.discountAmount,
      tip: order.tipAmount,
      serviceCharges: order.serviceChargeTotal,
      total: order.total,
      refunded: totalRefunded,
      netAmount: order.total - totalRefunded,
    },
    paymentMethod: order.paymentMethod,
    transactionId: order.squareTxnId,
    status: order.status,
    refunds: order.refunds,
  };
}

function generateEscPosCommands (order: any): string {
  // ESC/POS commands for thermal printers
  const ESC = '\x1B';
  const GS = '\x1D';

  let commands = '';

  // Initialize printer
  commands += `${ESC}@`;

  // Center align and bold for header
  commands += `${ESC}a` + '\x01'; // Center align
  commands += `${ESC}E` + '\x01'; // Bold on
  commands += 'LML REPAIR\n';
  commands += `${ESC}E` + '\x00'; // Bold off

  // Location info
  commands += `${order.storeLocation.name}\n`;
  commands += `${order.storeLocation.address}\n`;
  commands += `${order.storeLocation.phone}\n`;

  // Separator
  commands += '================================\n';

  // Left align for content
  commands += `${ESC}a` + '\x00'; // Left align

  // Order info
  commands += `Order #: ${order.id.slice(-8).toUpperCase()}\n`;
  commands += `Date: ${new Date(order.createdAt).toLocaleString()}\n`;
  commands += `Customer: ${order.customer.firstName} ${order.customer.lastName}\n`;
  commands += `Staff: ${order.staff.firstName} ${order.staff.lastName}\n`;
  commands += '--------------------------------\n';

  // Items
  order.items.forEach((item: any) => {
    commands += `${item.description}\n`;
    commands += `  ${item.quantity} x $${item.price.toFixed(2)} = $${(
      item.price * item.quantity
    ).toFixed(2)}\n`;
  });

  commands += '--------------------------------\n';

  // Totals
  commands += `Subtotal:        $${order.subtotal.toFixed(2)}\n`;
  if (order.taxAmount > 0) {
    commands += `Tax:             $${order.taxAmount.toFixed(2)}\n`;
  }
  if (order.discountAmount > 0) {
    commands += `Discount:       -$${order.discountAmount.toFixed(2)}\n`;
  }
  if (order.tipAmount > 0) {
    commands += `Tip:             $${order.tipAmount.toFixed(2)}\n`;
  }
  if (order.serviceChargeTotal > 0) {
    commands += `Service Charges: $${order.serviceChargeTotal.toFixed(2)}\n`;
  }

  commands += '================================\n';
  commands += `${ESC}E` + '\x01'; // Bold on
  commands += `TOTAL:           $${order.total.toFixed(2)}\n`;
  commands += `${ESC}E` + '\x00'; // Bold off
  commands += '================================\n';

  // Payment info
  commands += `Payment: ${order.paymentMethod || 'N/A'}\n`;
  if (order.squareTxnId) {
    commands += `Transaction ID: ${order.squareTxnId}\n`;
  }

  // Footer
  commands += '\n';
  commands += `${ESC}a` + '\x01'; // Center align
  commands += 'Thank you for your business!\n';
  commands += 'Visit us at lmlrepair.com\n';
  commands += '\n\n\n';

  // Cut paper
  commands += `${GS}V` + '\x42' + '\x00';

  return commands;
}
