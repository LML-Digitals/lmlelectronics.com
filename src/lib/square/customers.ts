import { squareClient, SQUARE_LOCATION_ID } from "./client";
import { SquareCustomer } from "@/types/square";
import { randomUUID } from "crypto";

/**
 * Create a new customer
 */
export async function createCustomer(customerData: {
  givenName?: string;
  familyName?: string;
  companyName?: string;
  nickname?: string;
  emailAddress?: string;
  phoneNumber?: string;
  referenceId?: string;
  note?: string;
  birthday?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    locality?: string;
    administrativeDistrictLevel1?: string;
    postalCode?: string;
    country?: string;
  };
}): Promise<SquareCustomer | null> {
  try {
    const request: any = {
      idempotencyKey: randomUUID(),
      ...customerData,
    };

    const response = await squareClient.customers.create(request);

    if (!response || !response.customer) {
      console.error("Failed to create customer");
      return null;
    }

    return convertSquareCustomerResponse(response.customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    return null;
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(
  customerId: string,
  customerData: Partial<SquareCustomer>
): Promise<SquareCustomer | null> {
  try {
    const request: any = {
      customerId,
      ...customerData,
    };

    const response = await squareClient.customers.update(request);

    if (!response || !response.customer) {
      console.error("Failed to update customer");
      return null;
    }

    return convertSquareCustomerResponse(response.customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return null;
  }
}

/**
 * Get customer by ID
 */
export async function getCustomerById(
  customerId: string
): Promise<SquareCustomer | null> {
  try {
    const response = await squareClient.customers.get({ customerId });

    if (!response || !response.customer) {
      console.error("Failed to retrieve customer");
      return null;
    }

    return convertSquareCustomerResponse(response.customer);
  } catch (error) {
    console.error("Error retrieving customer:", error);
    return null;
  }
}

/**
 * Search customers
 */
export async function searchCustomers(
  filters: {
    emailAddress?: string;
    phoneNumber?: string;
    referenceId?: string;
    query?: string;
    cursor?: string;
    limit?: number;
  } = {}
): Promise<{ customers: SquareCustomer[]; cursor?: string }> {
  try {
    const searchFilters: any[] = [];

    if (filters.emailAddress) {
      searchFilters.push({
        emailAddress: {
          exact: filters.emailAddress,
        },
      });
    }

    if (filters.phoneNumber) {
      searchFilters.push({
        phoneNumber: {
          exact: filters.phoneNumber,
        },
      });
    }

    if (filters.referenceId) {
      searchFilters.push({
        referenceId: {
          exact: filters.referenceId,
        },
      });
    }

    if (filters.query) {
      searchFilters.push({
        textFilter: {
          exact: filters.query,
        },
      });
    }

    const request: any = {
      cursor: filters.cursor,
      limit: BigInt(filters.limit || 50),
      ...(searchFilters.length > 0 && {
        query: {
          filter: {
            andFilter: {
              filters: searchFilters,
            },
          },
        },
      }),
    };

    const response = await squareClient.customers.search(request);

    if (!response) {
      console.error("Failed to search customers");
      return { customers: [] };
    }

    const customers = (response.customers || []).map(
      convertSquareCustomerResponse
    );

    return {
      customers,
      cursor: response.cursor,
    };
  } catch (error) {
    console.error("Error searching customers:", error);
    return { customers: [] };
  }
}

/**
 * List all customers
 */
export async function listCustomers(
  cursor?: string,
  limit: number = 50
): Promise<{ customers: SquareCustomer[]; cursor?: string }> {
  try {
    const response = await squareClient.customers.list({
      cursor,
      limit,
      sortField: "DEFAULT",
      sortOrder: "ASC",
    });

    if (!response) {
      console.error("Failed to list customers");
      return { customers: [] };
    }

    // Handle paginated response
    const customers: SquareCustomer[] = [];
    if (response.data) {
      for await (const customer of response.data) {
        customers.push(convertSquareCustomerResponse(customer));
      }
    }

    return {
      customers,
      cursor: undefined, // TODO: Handle cursor from paginated response
    };
  } catch (error) {
    console.error("Error listing customers:", error);
    return { customers: [] };
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(customerId: string): Promise<boolean> {
  try {
    const response = await squareClient.customers.delete({ customerId });

    if (!response) {
      console.error("Failed to delete customer");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting customer:", error);
    return false;
  }
}

/**
 * Get customer by email address
 */
export async function getCustomerByEmail(
  emailAddress: string
): Promise<SquareCustomer | null> {
  try {
    const searchResult = await searchCustomers({ emailAddress });
    return searchResult.customers.length > 0 ? searchResult.customers[0] : null;
  } catch (error) {
    console.error("Error getting customer by email:", error);
    return null;
  }
}

/**
 * Create or get customer by email
 */
export async function createOrGetCustomerByEmail(
  emailAddress: string,
  additionalData?: {
    givenName?: string;
    familyName?: string;
    phoneNumber?: string;
  }
): Promise<SquareCustomer | null> {
  try {
    // First try to find existing customer
    const existingCustomer = await getCustomerByEmail(emailAddress);
    if (existingCustomer) {
      return existingCustomer;
    }

    // Create new customer if not found
    return await createCustomer({
      emailAddress,
      ...additionalData,
    });
  } catch (error) {
    console.error("Error creating or getting customer by email:", error);
    return null;
  }
}

/**
 * Add card to customer (placeholder - requires proper payment setup)
 */
export async function addCardToCustomer(
  customerId: string,
  sourceId: string // Payment source from Web Payments SDK
): Promise<any> {
  try {
    // This would typically involve the Customers API to create a card for the customer
    // For now, return a placeholder
    console.log("Add card to customer not yet implemented:", {
      customerId,
      sourceId,
    });
    return null;
  } catch (error) {
    console.error("Error adding card to customer:", error);
    return null;
  }
}

/**
 * Get customer cards (placeholder)
 */
export async function getCustomerCards(customerId: string): Promise<any[]> {
  try {
    // This would typically retrieve cards associated with the customer
    // For now, return empty array
    console.log("Get customer cards not yet implemented:", customerId);
    return [];
  } catch (error) {
    console.error("Error getting customer cards:", error);
    return [];
  }
}

/**
 * Helper function to convert Square Customer response to our type
 */
function convertSquareCustomerResponse(customer: any): SquareCustomer {
  return {
    id: customer.id,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    cards: customer.cards || [],
    givenName: customer.givenName,
    familyName: customer.familyName,
    nickname: customer.nickname,
    companyName: customer.companyName,
    emailAddress: customer.emailAddress,
    address: customer.address,
    phoneNumber: customer.phoneNumber,
    birthday: customer.birthday,
    referenceId: customer.referenceId,
    note: customer.note,
    preferences: customer.preferences,
    creationSource: customer.creationSource,
    groupIds: customer.groupIds || [],
    segmentIds: customer.segmentIds || [],
    version: customer.version,
    taxIds: customer.taxIds,
  };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

/**
 * Format customer name for display
 */
export function formatCustomerName(customer: SquareCustomer): string {
  if (customer.givenName && customer.familyName) {
    return `${customer.givenName} ${customer.familyName}`;
  }
  if (customer.givenName) {
    return customer.givenName;
  }
  if (customer.familyName) {
    return customer.familyName;
  }
  if (customer.companyName) {
    return customer.companyName;
  }
  if (customer.emailAddress) {
    return customer.emailAddress;
  }
  return `Customer ${customer.id}`;
}
