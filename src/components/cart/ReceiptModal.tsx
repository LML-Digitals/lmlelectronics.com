'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  CircleUser,
  MapPin,
  Truck,
  Package,
  Download,
  Home,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    customerName: string;
    items: any[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    paymentMethod: string;
    orderDate: string;
    deliveryMethod?: 'pickup' | 'shipping';
    shippingAddress?: {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      zipCode: string;
      phone: string;
    };
  };
}

export default function ReceiptModal ({
  isOpen,
  onClose,
  orderData,
}: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Format the order date
  const formattedDate = orderData.orderDate
    ? new Date(orderData.orderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : format(new Date(), 'MMMM dd, yyyy');

  const handlePrint = () => {
    setIsPrinting(true);
    const printContent = document.getElementById('receipt-content');
    const originalContents = document.body.innerHTML;

    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
    }

    setIsPrinting(false);
    // Re-attach event listeners or React components
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="flex justify-between items-center">
          <span>Order Receipt</span>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isPrinting ? 'Printing...' : 'Print Receipt'}
          </Button>
        </DialogTitle>

        <div id="receipt-content" className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">
                LML Repair - Order #{orderData.orderId.substring(0, 8)}
              </h3>
              <p className="text-muted-foreground">{formattedDate}</p>
            </div>
            <div className="rounded-xl bg-primary/5 p-2">
              <h4 className="font-semibold">Payment Method</h4>
              <p>{orderData.paymentMethod}</p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground">
                <CircleUser className="mr-2 h-4 w-4" />
                <span>Customer</span>
              </div>
              <p className="font-medium">{orderData.customerName}</p>
            </div>

            {orderData.deliveryMethod === 'shipping'
            && orderData.shippingAddress ? (
                <div className="space-y-1">
                  <div className="flex items-center text-muted-foreground">
                    <Truck className="mr-2 h-4 w-4" />
                    <span>Shipping Address</span>
                  </div>
                  <p className="font-medium">
                    {orderData.shippingAddress.fullName}
                  </p>
                  <p>{orderData.shippingAddress.addressLine1}</p>
                  {orderData.shippingAddress.addressLine2 && (
                    <p>{orderData.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {orderData.shippingAddress.city},{' '}
                    {orderData.shippingAddress.state}{' '}
                    {orderData.shippingAddress.zipCode}
                  </p>
                  <p>Phone: {orderData.shippingAddress.phone}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center text-muted-foreground">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Pickup Location</span>
                  </div>
                  <p className="font-medium">LML Repair Store</p>
                  <p>1234 Main Street</p>
                  <p>Seattle, WA 98101</p>
                </div>
              )}

            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground">
                <Package className="mr-2 h-4 w-4" />
                <span>Delivery Method</span>
              </div>
              <p className="font-medium">
                {orderData.deliveryMethod === 'shipping'
                  ? 'FedEx Shipping'
                  : 'Store Pickup'}
              </p>
            </div>
          </div>

          <Separator />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end">
            <div className="w-1/3 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {orderData.deliveryMethod === 'shipping'
                    ? 'Shipping'
                    : 'Handling'}
                </span>
                <span>${orderData.shipping.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-center text-muted-foreground mt-8">
            <p>Thank you for choosing LML Repair.</p>
            <p>
              If you have any questions, please contact us at
              support@lmlrepair.com
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
