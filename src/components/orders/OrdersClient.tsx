"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import type { OrderDetails  } from "@/types/api";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerOrders,
  getOrdersByCustomerEmail,
} from "@/app/actions/orders";

export default function OrdersClient() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const result = await getOrdersByCustomerEmail(email);
      const data = result.data;
      setOrders(data as unknown as OrderDetails[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-300px)]">
      <div className="text-center space-y-20">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-secondary animate-pulse">
            My Orders
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and track all your orders
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-800">
                {loading ? "Loading..." : "Find Orders"}
              </Button>
            </div>
          </form>

          <div className="text-left">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold">Order History</h2>
                <p className="text-muted-foreground">
                  {orders.length} {orders.length === 1 ? "order" : "orders"}{" "}
                  found
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-500 text-center mb-6">
                    {email
                      ? "No orders found for this email address."
                      : "Enter your email address to view your orders."}
                  </p>
                  <Link href="/products">
                    <Button className="bg-black text-white hover:bg-gray-800">Start Shopping</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const totalItems = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );

                  return (
                    <Card
                      key={order.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <h3 className="font-semibold text-lg">
                                Order #{order.id.slice(-8).toUpperCase()}
                              </h3>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Date:</span>{" "}
                                {format(
                                  new Date(order.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </div>
                              <div>
                                <span className="font-medium">Items:</span>{" "}
                                {totalItems}{" "}
                                {totalItems === 1 ? "item" : "items"}
                              </div>
                              <div>
                                <span className="font-medium">Store:</span>{" "}
                                {order.storeLocation.name}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-900">
                                  Total: ${order.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
