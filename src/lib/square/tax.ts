import { squareClient, SQUARE_LOCATION_ID } from "./client";
import { convertPriceToSquareAmount } from "@/types/product";

/**
 * Calculate taxes for an order using Square's tax calculation
 */
export async function calculateTax(
  items: Array<{
    id: string;
    name: string;
    price: number; // in dollars
    quantity: number;
    catalogObjectId?: string;
  }>,
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
): Promise<{
  totalTax: number; // in dollars
  itemTaxes: Array<{
    itemId: string;
    tax: number;
  }>;
  taxDetails?: any;
} | null> {
  try {
    // Create a draft order to calculate taxes
    const lineItems = items.map((item) => ({
      name: item.name,
      quantity: item.quantity.toString(),
      basePriceMoney: {
        amount: convertPriceToSquareAmount(item.price),
        currency: "USD",
      },
      ...(item.catalogObjectId && { catalogObjectId: item.catalogObjectId }),
    }));

    const orderRequest: any = {
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems,
        ...(shippingAddress && {
          fulfillments: [
            {
              type: "SHIPMENT",
              shipmentDetails: {
                recipient: {
                  address: {
                    addressLine1: shippingAddress.address,
                    locality: shippingAddress.city,
                    administrativeDistrictLevel1: shippingAddress.state,
                    postalCode: shippingAddress.zipCode,
                    country: shippingAddress.country,
                  },
                },
              },
            },
          ],
        }),
      },
    };

    // Create the order to get tax calculations
    const response = await squareClient.orders.create(orderRequest);

    if (!response || !response.order) {
      console.error("Failed to create order for tax calculation");
      return null;
    }

    const order = response.order;
    const totalTaxMoney = order.totalTaxMoney?.amount || BigInt(0);
    const totalTax = Number(totalTaxMoney) / 100; // Convert from cents to dollars

    // Extract individual item taxes
    const itemTaxes =
      order.lineItems?.map((lineItem: any, index: number) => ({
        itemId: items[index].id,
        tax: lineItem.totalTaxMoney
          ? Number(lineItem.totalTaxMoney.amount) / 100
          : 0,
      })) || [];

    return {
      totalTax,
      itemTaxes,
      taxDetails: order.taxes,
    };
  } catch (error) {
    console.error("Error calculating tax:", error);
    return null;
  }
}

/**
 * Get tax rates for a location
 */
export async function getTaxRates(
  locationId: string = SQUARE_LOCATION_ID
): Promise<any[] | null> {
  try {
    // Note: This would require the Tax API if available
    // For now, return null as tax calculation is handled in order creation
    console.log(
      "Tax rates API not implemented - taxes calculated in order creation"
    );
    return null;
  } catch (error) {
    console.error("Error fetching tax rates:", error);
    return null;
  }
}
