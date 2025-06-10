import { squareClient, SQUARE_LOCATION_ID } from "./client";
import { Cart, CartItem } from "@/types/product";
import { SquareOrder } from "@/types/square";
import { randomUUID } from "crypto";

/**
 * Create an order from a cart
 */
export async function createOrderFromCart(
  cart: Cart,
  customerId?: string,
  note?: string
): Promise<SquareOrder | null> {
  try {
    const orderRequest: any = {
      idempotencyKey: randomUUID(),
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems: cart.items.map((item) =>
          convertCartItemToOrderLineItem(item)
        ),
        ...(customerId && { customerId }),
        ...(note && { note }),
      },
    };

    const response = await squareClient.orders.create(orderRequest);

    if (!response || !response.order) {
      console.error("Failed to create order");
      return null;
    }

    return convertSquareOrderToOrder(response.order);
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
}

/**
 * Update an order
 */
export async function updateOrder(
  orderId: string,
  orderData: any
): Promise<SquareOrder | null> {
  try {
    const updateRequest: any = {
      idempotencyKey: randomUUID(),
      order: {
        locationId: SQUARE_LOCATION_ID,
        version: orderData.version,
        ...orderData,
      },
    };

    const response = await squareClient.orders.update({
      orderId,
      ...updateRequest,
    });

    if (!response || !response.order) {
      console.error("Failed to update order");
      return null;
    }

    return convertSquareOrderToOrder(response.order);
  } catch (error) {
    console.error("Error updating order:", error);
    return null;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(
  orderId: string
): Promise<SquareOrder | null> {
  try {
    const response = await squareClient.orders.get({
      orderId: orderId,
    });

    if (!response || !response.order) {
      console.error("Failed to retrieve order");
      return null;
    }

    return convertSquareOrderToOrder(response.order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

/**
 * Search orders with filters
 */
export async function searchOrders(filters: {
  customerId?: string;
  locationIds?: string[];
  cursor?: string;
  limit?: number;
  sortOrder?: "ASC" | "DESC";
}): Promise<{ orders: SquareOrder[]; cursor?: string }> {
  try {
    const searchRequest: any = {
      locationIds: filters.locationIds || [SQUARE_LOCATION_ID],
      cursor: filters.cursor,
      limit: filters.limit || 50,
      query: {
        sort: {
          sortField: "UPDATED_AT",
          sortOrder: filters.sortOrder || "DESC",
        },
        ...(filters.customerId && {
          filter: {
            customerFilter: {
              customerIds: [filters.customerId],
            },
          },
        }),
      },
    };

    const response = await squareClient.orders.search(searchRequest);

    if (!response || !response.orders) {
      console.error("Failed to search orders");
      return { orders: [] };
    }

    const orders = response.orders.map((order: any) =>
      convertSquareOrderToOrder(order)
    );

    return {
      orders,
      cursor: response.cursor,
    };
  } catch (error) {
    console.error("Error searching orders:", error);
    return { orders: [] };
  }
}

/**
 * Calculate order totals without creating the order
 */
export async function calculateOrder(
  lineItems: CartItem[]
): Promise<{ total: number; subtotal: number; tax: number } | null> {
  try {
    const orderRequest: any = {
      idempotencyKey: randomUUID(),
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems: lineItems.map((item) =>
          convertCartItemToOrderLineItem(item)
        ),
      },
    };

    const response = await squareClient.orders.calculate(orderRequest);

    if (!response || !response.order) {
      console.error("Failed to calculate order");
      return null;
    }

    const order = response.order;
    return {
      total: Number(order.totalMoney?.amount || 0),
      subtotal: Number(order.netAmounts?.totalMoney?.amount || 0),
      tax: Number(order.totalTaxMoney?.amount || 0),
    };
  } catch (error) {
    console.error("Error calculating order:", error);
    return null;
  }
}

/**
 * Pay for an order
 */
export async function payOrder(
  orderId: string,
  paymentIds: string[],
  idempotencyKey?: string
): Promise<SquareOrder | null> {
  try {
    const response = await squareClient.orders.pay({
      orderId,
      idempotencyKey: idempotencyKey || randomUUID(),
      paymentIds,
    });

    if (!response || !response.order) {
      console.error("Failed to pay order");
      return null;
    }

    return convertSquareOrderToOrder(response.order);
  } catch (error) {
    console.error("Error paying order:", error);
    return null;
  }
}

/**
 * Helper function to convert CartItem to Square OrderLineItem
 */
function convertCartItemToOrderLineItem(item: CartItem): any {
  return {
    name: item.name,
    quantity: item.quantity.toString(),
    catalogObjectId: item.productId,
    variationName: item.options
      ? Object.values(item.options).join(", ")
      : undefined,
    basePriceMoney: {
      amount: BigInt(item.price),
      currency: item.currency,
    },
    totalMoney: {
      amount: BigInt(item.price * item.quantity),
      currency: item.currency,
    },
  };
}

/**
 * Helper function to convert Square Order to our SquareOrder type
 */
function convertSquareOrderToOrder(squareOrder: any): SquareOrder {
  return {
    id: squareOrder.id,
    locationId: squareOrder.locationId,
    lineItems: (squareOrder.lineItems || []).map((item: any) => ({
      uid: item.uid,
      name: item.name,
      quantity: item.quantity || "1",
      itemType: item.itemType,
      catalogObjectId: item.catalogObjectId,
      variationName: item.variationName,
      basePriceMoney: item.basePriceMoney
        ? {
            amount: BigInt(item.basePriceMoney.amount || 0),
            currency: item.basePriceMoney.currency || "USD",
          }
        : undefined,
      totalMoney: item.totalMoney
        ? {
            amount: BigInt(item.totalMoney.amount || 0),
            currency: item.totalMoney.currency || "USD",
          }
        : undefined,
    })),
    totalMoney: squareOrder.totalMoney
      ? {
          amount: BigInt(squareOrder.totalMoney.amount || 0),
          currency: squareOrder.totalMoney.currency || "USD",
        }
      : undefined,
    totalTaxMoney: squareOrder.totalTaxMoney
      ? {
          amount: BigInt(squareOrder.totalTaxMoney.amount || 0),
          currency: squareOrder.totalTaxMoney.currency || "USD",
        }
      : undefined,
    totalDiscountMoney: squareOrder.totalDiscountMoney
      ? {
          amount: BigInt(squareOrder.totalDiscountMoney.amount || 0),
          currency: squareOrder.totalDiscountMoney.currency || "USD",
        }
      : undefined,
    customerId: squareOrder.customerId,
    state: squareOrder.state,
    version: squareOrder.version,
    createdAt: squareOrder.createdAt,
    updatedAt: squareOrder.updatedAt,
    closedAt: squareOrder.closedAt,
    referenceId: squareOrder.referenceId,
  };
}

/**
 * Cart utility functions
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function addToCart(cart: CartItem[], newItem: CartItem): CartItem[] {
  const existingItemIndex = cart.findIndex(
    (item) =>
      item.productId === newItem.productId &&
      item.variationId === newItem.variationId &&
      JSON.stringify(item.options) === JSON.stringify(newItem.options)
  );

  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    const updatedCart = [...cart];
    updatedCart[existingItemIndex] = {
      ...updatedCart[existingItemIndex],
      quantity: updatedCart[existingItemIndex].quantity + newItem.quantity,
    };
    return updatedCart;
  } else {
    // Add new item to cart
    return [...cart, newItem];
  }
}

export function removeFromCart(cart: CartItem[], itemId: string): CartItem[] {
  return cart.filter((item) => item.id !== itemId);
}

export function updateCartItemQuantity(
  cart: CartItem[],
  itemId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(cart, itemId);
  }

  return cart.map((item) =>
    item.id === itemId ? { ...item, quantity } : item
  );
}

/**
 * Create a new order
 */
export async function createOrder(orderData: {
  locationId: string;
  lineItems: Array<{
    name: string;
    quantity: string;
    basePriceMoney: {
      amount: number;
      currency: string;
    };
    catalogObjectId?: string;
  }>;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<SquareOrder | null> {
  try {
    const orderRequest: any = {
      idempotencyKey: randomUUID(),
      order: {
        locationId: orderData.locationId,
        lineItems: orderData.lineItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          basePriceMoney: {
            amount: BigInt(item.basePriceMoney.amount),
            currency: item.basePriceMoney.currency,
          },
          ...(item.catalogObjectId && {
            catalogObjectId: item.catalogObjectId,
          }),
        })),
        ...(orderData.customerId && { customerId: orderData.customerId }),
        ...(orderData.metadata && { metadata: orderData.metadata }),
      },
    };

    const response = await squareClient.orders.create(orderRequest);

    if (!response || !response.order) {
      console.error("Failed to create order");
      return null;
    }

    return convertSquareOrderToOrder(response.order);
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
}
