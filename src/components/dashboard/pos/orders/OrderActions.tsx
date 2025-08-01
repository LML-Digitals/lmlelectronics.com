"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  processRefund,
  // syncOrderWithSquare,
} from "@/components/dashboard/pos/orders/services/pos-orders";
import {
  emailReceipt,
  printReceipt,
} from "@/components/dashboard/pos/orders/services/pos-receipts";
import { toast } from "@/components/ui/use-toast";
import { Printer, Mail, RefreshCw, DollarSign, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import type { OrderWithDetails } from "@/components/dashboard/pos/orders/services/pos-orders";

interface OrderActionsProps {
  order: OrderWithDetails;
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const totalRefunded = order.refunds.reduce(
    (sum, refund) => sum + refund.amount,
    0
  );
  const maxRefundAmount = order.total - totalRefunded;
  const canRefund = maxRefundAmount > 0 && order.status !== "REFUNDED";
  const canSync =
    order.squareTxnId &&
    (order.status === "PENDING" || order.status === "INVOICED");

  const handlePrintReceipt = async () => {
    setIsPrinting(true);

    try {
      const result = await printReceipt(order.id);

      if (result.success) {
        // In a real implementation, you would send the print commands to the printer
        // For now, we'll show the receipt data in a new window for printing
        if (result.receiptData) {
          const printWindow = window.open("", "_blank");
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>Receipt - Order ${order.id
                    .slice(-8)
                    .toUpperCase()}</title>
                  <style>
                    body { font-family: 'Courier New', monospace; font-size: 12px; margin: 20px; }
                    .receipt { max-width: 300px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                    .line { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    .total { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
                    @media print { body { margin: 0; } }
                  </style>
                </head>
                <body>
                  <div class="receipt">
                    <div class="header">
                      <h2>LML REPAIR</h2>
                      <div>${result.receiptData.location.name}</div>
                      <div>${result.receiptData.location.address}</div>
                      <div>${result.receiptData.location.phone}</div>
                    </div>
                    <div class="line"><span>Order #:</span><span>${
                      result.receiptData.orderId
                    }</span></div>
                    <div class="line"><span>Date:</span><span>${
                      result.receiptData.date
                    }</span></div>
                    <div class="line"><span>Customer:</span><span>${
                      result.receiptData.customer.name
                    }</span></div>
                    <div class="line"><span>Staff:</span><span>${
                      result.receiptData.staff
                    }</span></div>
                    <hr>
                    ${result.receiptData.items
                      .map(
                        (item: any) => `
                      <div class="line"><span>${
                        item.description
                      }</span><span></span></div>
                      <div class="line"><span>&nbsp;&nbsp;${
                        item.quantity
                      } x $${item.price.toFixed(
                          2
                        )}</span><span>$${item.total.toFixed(2)}</span></div>
                    `
                      )
                      .join("")}
                    <hr>
                    <div class="line"><span>Subtotal:</span><span>$${result.receiptData.totals.subtotal.toFixed(
                      2
                    )}</span></div>
                    ${
                      result.receiptData.totals.tax > 0
                        ? `<div class="line"><span>Tax:</span><span>$${result.receiptData.totals.tax.toFixed(
                            2
                          )}</span></div>`
                        : ""
                    }
                    ${
                      result.receiptData.totals.discount > 0
                        ? `<div class="line"><span>Discount:</span><span>-$${result.receiptData.totals.discount.toFixed(
                            2
                          )}</span></div>`
                        : ""
                    }
                    ${
                      result.receiptData.totals.tip > 0
                        ? `<div class="line"><span>Tip:</span><span>$${result.receiptData.totals.tip.toFixed(
                            2
                          )}</span></div>`
                        : ""
                    }
                    <div class="line total"><span>TOTAL:</span><span>$${result.receiptData.totals.total.toFixed(
                      2
                    )}</span></div>
                    <hr>
                    <div class="line"><span>Payment:</span><span>${
                      result.receiptData.paymentMethod
                    }</span></div>
                    <div style="text-align: center; margin-top: 20px;">
                      <div>Thank you for your business!</div>
                      <div>Visit us at lmlrepair.com</div>
                    </div>
                  </div>
                  <script>window.print(); window.onafterprint = function() { window.close(); };</script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
        }

        toast({
          title: "Receipt ready for printing",
          description: "A print dialog has been opened",
        });
      } else {
        toast({
          title: "Failed to prepare receipt",
          description: result.error || "Unable to prepare receipt for printing",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Print error",
        description: "An unexpected error occurred while preparing the receipt",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleEmailReceipt = async () => {
    setIsEmailing(true);

    try {
      const result = await emailReceipt(order.id, order.customer.email);

      if (result.success) {
        toast({
          title: "Receipt sent successfully",
          description: `Receipt has been sent to ${order.customer.email}`,
        });
      } else {
        toast({
          title: "Failed to send receipt",
          description: result.error || "Unable to send email receipt",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Email error",
        description: "An unexpected error occurred while sending the receipt",
        variant: "destructive",
      });
    } finally {
      setIsEmailing(false);
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast({
        title: "Please enter a valid refund amount",
        description: "The refund amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(refundAmount) > maxRefundAmount) {
      toast({
        title: `Refund amount cannot exceed $${maxRefundAmount.toFixed(2)}`,
        description: "The refund amount must be less than the total amount",
        variant: "destructive",
      });
      return;
    }

    setIsRefunding(true);

    try {
      const result = await processRefund(
        order.id,
        parseFloat(refundAmount),
        refundReason || undefined
      );

      if (result.success) {
        toast({
          title: `Refund of $${refundAmount} processed successfully`,
          description: "The refund has been processed successfully",
        });
        setIsRefundDialogOpen(false);
        setRefundAmount("");
        setRefundReason("");
        router.refresh();
      } else {
        toast({
          title: result.error || "Failed to process refund",
          description: "The refund has not been processed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "An unexpected error occurred",
        description: "The refund has not been processed",
        variant: "destructive",
      });
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handlePrintReceipt}
          variant="outline"
          className="w-full justify-start"
          disabled={isPrinting}
        >
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? "Preparing..." : "Print Receipt"}
        </Button>

        <Button
          onClick={handleEmailReceipt}
          variant="outline"
          className="w-full justify-start"
          disabled={isEmailing}
        >
          <Mail className="mr-2 h-4 w-4" />
          {isEmailing ? "Sending..." : "Email Receipt"}
        </Button>

        <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={!canRefund}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Process Refund
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Refund</DialogTitle>
              <DialogDescription>
                Process a refund for order {order.id.slice(-8).toUpperCase()}.
                Maximum refundable amount: ${maxRefundAmount.toFixed(2)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refund-amount">Refund Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="refund-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={maxRefundAmount}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund-reason">Reason (Optional)</Label>
                <Textarea
                  id="refund-reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter reason for refund..."
                  rows={3}
                />
              </div>

              <div className="rounded-md bg-muted p-3">
                <h4 className="text-sm font-medium mb-2">Order Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Original Total:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Already Refunded:</span>
                    <span>${totalRefunded.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Available to Refund:</span>
                    <span>${maxRefundAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRefundDialogOpen(false)}
                disabled={isRefunding}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRefund}
                disabled={isRefunding || !refundAmount}
              >
                {isRefunding ? "Processing..." : "Process Refund"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!canRefund && (
          <p className="text-xs text-muted-foreground mt-2">
            {order.status === "REFUNDED"
              ? "This order has been fully refunded"
              : "No refundable amount remaining"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
