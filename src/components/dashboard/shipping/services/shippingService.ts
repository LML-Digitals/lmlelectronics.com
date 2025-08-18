'use server';

import prisma from '@/lib/prisma';

export type ShippingRateInput = {
  id?: string;
  state: string;
  stateName: string;
  rate: number;
  isActive: boolean;
};

export type ShippingRateFilters = {
  state?: string;
  isActive?: boolean;
};

// Create a new shipping rate
export async function createShippingRate (data: ShippingRateInput) {
  try {
    const shippingRate = await prisma.shippingRate.create({
      data: {
        state: data.state.toUpperCase(),
        stateName: data.stateName,
        rate: data.rate,
        isActive: data.isActive,
      },
    });

    return { success: true, shippingRate };
  } catch (error) {
    console.error('Error creating shipping rate:', error);

    return { success: false, error: 'Failed to create shipping rate' };
  }
}

// Update an existing shipping rate
export async function updateShippingRate (id: string, data: ShippingRateInput) {
  try {
    const shippingRate = await prisma.shippingRate.update({
      where: { id },
      data: {
        state: data.state.toUpperCase(),
        stateName: data.stateName,
        rate: data.rate,
        isActive: data.isActive,
      },
    });

    return { success: true, shippingRate };
  } catch (error) {
    console.error('Error updating shipping rate:', error);

    return { success: false, error: 'Failed to update shipping rate' };
  }
}

// Get all shipping rates
export async function getShippingRates (filters: ShippingRateFilters = {}) {
  try {
    const where: any = {};

    if (filters.state) {
      where.state = filters.state.toUpperCase();
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const shippingRates = await prisma.shippingRate.findMany({
      where,
      orderBy: [{ stateName: 'asc' }],
    });

    return { success: true, shippingRates };
  } catch (error) {
    console.error('Error fetching shipping rates:', error);

    return { success: false, error: 'Failed to fetch shipping rates' };
  }
}

// Get a single shipping rate by ID
export async function getShippingRate (id: string) {
  try {
    const shippingRate = await prisma.shippingRate.findUnique({
      where: { id },
    });

    if (!shippingRate) {
      return { success: false, error: 'Shipping rate not found' };
    }

    return { success: true, shippingRate };
  } catch (error) {
    console.error('Error fetching shipping rate:', error);

    return { success: false, error: 'Failed to fetch shipping rate' };
  }
}

// Get shipping rate by state
export async function getShippingRateByState (state: string) {
  try {
    const shippingRate = await prisma.shippingRate.findUnique({
      where: {
        state: state.toUpperCase(),
        isActive: true,
      },
    });

    if (!shippingRate) {
      return {
        success: false,
        error: 'Shipping rate not found for this state',
      };
    }

    return { success: true, shippingRate };
  } catch (error) {
    console.error('Error fetching shipping rate by state:', error);

    return { success: false, error: 'Failed to fetch shipping rate' };
  }
}

// Delete a shipping rate
export async function deleteShippingRate (id: string) {
  try {
    await prisma.shippingRate.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting shipping rate:', error);

    return { success: false, error: 'Failed to delete shipping rate' };
  }
}

// Get active shipping rates only
export async function getActiveShippingRates () {
  try {
    const shippingRates = await prisma.shippingRate.findMany({
      where: { isActive: true },
      orderBy: [{ stateName: 'asc' }],
    });

    return { success: true, shippingRates };
  } catch (error) {
    console.error('Error fetching active shipping rates:', error);

    return { success: false, error: 'Failed to fetch active shipping rates' };
  }
}

// Calculate shipping cost for a state
export async function calculateShippingCost (state: string) {
  try {
    const { shippingRate } = await getShippingRateByState(state);

    if (!shippingRate) {
      return { success: false, error: 'No shipping rate found for this state' };
    }

    return {
      success: true,
      shippingCost: shippingRate.rate,
      shippingRate,
    };
  } catch (error) {
    console.error('Error calculating shipping cost:', error);

    return { success: false, error: 'Failed to calculate shipping cost' };
  }
}

// Bulk update shipping rates
export async function bulkUpdateShippingRates (updates: { id: string; rate: number }[]) {
  try {
    const results = [];

    for (const update of updates) {
      const shippingRate = await prisma.shippingRate.update({
        where: { id: update.id },
        data: { rate: update.rate },
      });

      results.push(shippingRate);
    }

    return {
      success: true,
      message: `Updated ${results.length} shipping rates.`,
      shippingRates: results,
    };
  } catch (error) {
    console.error('Error bulk updating shipping rates:', error);

    return { success: false, error: 'Failed to bulk update shipping rates' };
  }
}

// Initialize default shipping rates for all US states
export async function initializeDefaultShippingRates () {
  const usStates = [
    { state: 'AL', stateName: 'Alabama', rate: 5.99 },
    { state: 'AK', stateName: 'Alaska', rate: 15.99 },
    { state: 'AZ', stateName: 'Arizona', rate: 5.99 },
    { state: 'AR', stateName: 'Arkansas', rate: 5.99 },
    { state: 'CA', stateName: 'California', rate: 5.99 },
    { state: 'CO', stateName: 'Colorado', rate: 5.99 },
    { state: 'CT', stateName: 'Connecticut', rate: 5.99 },
    { state: 'DE', stateName: 'Delaware', rate: 5.99 },
    { state: 'FL', stateName: 'Florida', rate: 5.99 },
    { state: 'GA', stateName: 'Georgia', rate: 5.99 },
    { state: 'HI', stateName: 'Hawaii', rate: 15.99 },
    { state: 'ID', stateName: 'Idaho', rate: 5.99 },
    { state: 'IL', stateName: 'Illinois', rate: 5.99 },
    { state: 'IN', stateName: 'Indiana', rate: 5.99 },
    { state: 'IA', stateName: 'Iowa', rate: 5.99 },
    { state: 'KS', stateName: 'Kansas', rate: 5.99 },
    { state: 'KY', stateName: 'Kentucky', rate: 5.99 },
    { state: 'LA', stateName: 'Louisiana', rate: 5.99 },
    { state: 'ME', stateName: 'Maine', rate: 5.99 },
    { state: 'MD', stateName: 'Maryland', rate: 5.99 },
    { state: 'MA', stateName: 'Massachusetts', rate: 5.99 },
    { state: 'MI', stateName: 'Michigan', rate: 5.99 },
    { state: 'MN', stateName: 'Minnesota', rate: 5.99 },
    { state: 'MS', stateName: 'Mississippi', rate: 5.99 },
    { state: 'MO', stateName: 'Missouri', rate: 5.99 },
    { state: 'MT', stateName: 'Montana', rate: 5.99 },
    { state: 'NE', stateName: 'Nebraska', rate: 5.99 },
    { state: 'NV', stateName: 'Nevada', rate: 5.99 },
    { state: 'NH', stateName: 'New Hampshire', rate: 5.99 },
    { state: 'NJ', stateName: 'New Jersey', rate: 5.99 },
    { state: 'NM', stateName: 'New Mexico', rate: 5.99 },
    { state: 'NY', stateName: 'New York', rate: 5.99 },
    { state: 'NC', stateName: 'North Carolina', rate: 5.99 },
    { state: 'ND', stateName: 'North Dakota', rate: 5.99 },
    { state: 'OH', stateName: 'Ohio', rate: 5.99 },
    { state: 'OK', stateName: 'Oklahoma', rate: 5.99 },
    { state: 'OR', stateName: 'Oregon', rate: 5.99 },
    { state: 'PA', stateName: 'Pennsylvania', rate: 5.99 },
    { state: 'RI', stateName: 'Rhode Island', rate: 5.99 },
    { state: 'SC', stateName: 'South Carolina', rate: 5.99 },
    { state: 'SD', stateName: 'South Dakota', rate: 5.99 },
    { state: 'TN', stateName: 'Tennessee', rate: 5.99 },
    { state: 'TX', stateName: 'Texas', rate: 5.99 },
    { state: 'UT', stateName: 'Utah', rate: 5.99 },
    { state: 'VT', stateName: 'Vermont', rate: 5.99 },
    { state: 'VA', stateName: 'Virginia', rate: 5.99 },
    { state: 'WA', stateName: 'Washington', rate: 5.99 },
    { state: 'WV', stateName: 'West Virginia', rate: 5.99 },
    { state: 'WI', stateName: 'Wisconsin', rate: 5.99 },
    { state: 'WY', stateName: 'Wyoming', rate: 5.99 },
    { state: 'DC', stateName: 'District of Columbia', rate: 5.99 },
  ];

  try {
    const results = [];

    for (const stateData of usStates) {
      // Check if shipping rate already exists for this state
      const existingRate = await prisma.shippingRate.findUnique({
        where: { state: stateData.state },
      });

      if (!existingRate) {
        const shippingRate = await prisma.shippingRate.create({
          data: {
            state: stateData.state,
            stateName: stateData.stateName,
            rate: stateData.rate,
            isActive: true,
          },
        });

        results.push(shippingRate);
      }
    }

    return {
      success: true,
      message: `Initialized ${results.length} shipping rates.`,
      shippingRates: results,
    };
  } catch (error) {
    console.error('Error initializing default shipping rates:', error);

    return {
      success: false,
      error: 'Failed to initialize default shipping rates',
    };
  }
}
