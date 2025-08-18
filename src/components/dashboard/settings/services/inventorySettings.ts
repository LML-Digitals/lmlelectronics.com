'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/config/authOptions';
import {
  setSystemSetting,
  getSystemSetting,
  getSettingsByCategory,
} from './settingsCrud';
import { SettingCategory } from './settingsTypes';

// Define inventory settings keys as constants instead of exporting an object
const DEFAULT_SHIPPING_RATE = 'default_shipping_rate';
const DEFAULT_TAX_RATE = 'default_tax_rate';

/**
 * Initialize inventory settings if they don't exist
 */
export async function initializeInventorySettings () {
  const defaultSettings = [
    {
      key: DEFAULT_SHIPPING_RATE,
      value: '0.00',
      category: SettingCategory.INVENTORY,
      name: 'Default Shipping Rate',
      description: 'Default shipping rate for all inventory items',
    },
    {
      key: DEFAULT_TAX_RATE,
      value: '0.00',
      category: SettingCategory.INVENTORY,
      name: 'Default Tax Rate',
      description: 'Default tax rate for all inventory items',
    },
  ];

  // Create settings if they don't exist
  for (const setting of defaultSettings) {
    await setSystemSetting(setting);
  }
}

/**
 * Get inventory settings, and initialize them if they don't exist
 */
export async function getInventorySettings () {
  // First try to get existing settings
  const settings = await getSettingsByCategory(SettingCategory.INVENTORY);

  // If no settings found, initialize them
  if (settings.length === 0) {
    console.log('No inventory settings found. Initializing defaults...');
    await initializeInventorySettings();

    // Fetch again after initialization
    return await getSettingsByCategory(SettingCategory.INVENTORY);
  }

  return settings;
}

/**
 * Get default shipping rate
 */
export async function getDefaultShippingRate (): Promise<number> {
  // Try to get the setting
  let value = await getSystemSetting('default_shipping_rate');

  // If the setting doesn't exist, initialize it
  if (value === null) {
    console.log('Shipping rate setting not found. Initializing defaults...');
    await initializeInventorySettings();
    value = await getSystemSetting(DEFAULT_SHIPPING_RATE);
  }

  return parseFloat(value as string);
}

/**
 * Get default tax rate
 */
export async function getDefaultTaxRate (): Promise<number> {
  // Try to get the setting
  let value = await getSystemSetting('default_tax_rate');

  // If the setting doesn't exist, initialize it
  if (value === null) {
    console.log('Tax rate setting not found. Initializing defaults...');
    await initializeInventorySettings();
    value = await getSystemSetting(DEFAULT_TAX_RATE);
  }

  return parseFloat(value as string);
}

/**
 * Recalculate prices for all variations that use default rates
 */
async function recalculateVariationsWithDefaultRates () {
  try {
    // Find all variations that use default rates
    const variations = await prisma.inventoryVariation.findMany({
      where: {
        useDefaultRates: true,
      },
    });

    console.log(`Recalculating prices for ${variations.length} variations that use default rates`);

    // Get default rates
    const defaultShipping = await getDefaultShippingRate();
    const defaultTax = await getDefaultTaxRate();

    // Update each variation
    for (const variation of variations) {
      const raw = variation.raw || 0;

      // Calculate new totals using default rates
      const cost = raw + raw * (defaultTax / 100) + defaultShipping;
      const totalCost = variation.markup
        ? cost + cost * (variation.markup / 100)
        : cost;
      const profit = totalCost - cost;

      // Update the variation with new calculated values
      await prisma.inventoryVariation.update({
        where: { id: variation.id },
        data: {
          tax: defaultTax,
          shipping: defaultShipping,
          totalCost,
          profit,
          sellingPrice: totalCost,
        },
      });

      // Recalculate prices for any linked repair options
      try {
        const linkedRepairOptions = await prisma.repairOption.findMany({
          where: { variationId: variation.id },
          select: { id: true },
        });

        // for (const repairOption of linkedRepairOptions) {
        //   await recalculateAndUpdateRepairOptionPrice(
        //     repairOption.id,
        //     variation.id
        //   );
        // }
      } catch (error) {
        console.error(
          `Error recalculating repair options for variation ${variation.id}:`,
          error,
        );
      }
    }

    console.log('Price recalculation completed successfully');
  } catch (error) {
    console.error('Error recalculating variation prices:', error);
  }
}

/**
 * Update default inventory rates
 */
export async function updateInventoryRates (formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Authentication required');
  }

  if (!['admin', 'manager', 'staff'].includes(session.user.role)) {
    throw new Error('Permission denied');
  }

  const shippingRate = formData.get('shippingRate') as string;
  const taxRate = formData.get('taxRate') as string;

  // Update shipping rate
  await setSystemSetting({
    key: DEFAULT_SHIPPING_RATE,
    value: shippingRate,
    category: SettingCategory.INVENTORY,
  });

  // Update tax rate
  await setSystemSetting({
    key: DEFAULT_TAX_RATE,
    value: taxRate,
    category: SettingCategory.INVENTORY,
  });

  // Recalculate prices for all variations that use default rates
  await recalculateVariationsWithDefaultRates();

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/inventory/items');

  return { success: true };
}
