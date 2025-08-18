'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/config/authOptions';
import { redirect } from 'next/navigation';
import {
  SettingCategory,
  SettingScope,
  SettingValue,
  parseSettingValue,
  stringifySettingValue,
} from './settingsTypes';

/**
 * Verify admin access or throw error
 */
async function verifyAdminAccess () {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Authentication required');
  }

  if (session.user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return session.user;
}

/**
 * Get a system-wide setting value
 */
export async function getSystemSetting (key: string): Promise<SettingValue> {
  const setting = await prisma.settings.findUnique({
    where: { key },
    include: { systemValues: true },
  });

  if (!setting) {
    console.log(`Warning: Setting with key '${key}' not found`);

    return null;
  }

  // If there's a system value, use it
  if (setting.systemValues.length > 0) {
    return parseSettingValue(setting.systemValues[0].value);
  }

  // Otherwise use default value
  return parseSettingValue(setting.defaultValue);
}

/**
 * Set a system-wide setting value
 */
export async function setSystemSetting (formData:
    | FormData
    | {
        key: string;
        value: SettingValue;
        category?: SettingCategory;
        name?: string;
        description?: string;
      }) {
  await verifyAdminAccess();

  // Get form values
  const key
    = formData instanceof FormData
      ? (formData.get('key') as string)
      : formData.key;
  const value
    = formData instanceof FormData
      ? (formData.get('value') as string)
      : formData.value;
  const category
    = formData instanceof FormData
      ? (formData.get('category') as SettingCategory) || SettingCategory.SYSTEM
      : formData.category || SettingCategory.SYSTEM;
  const name
    = formData instanceof FormData
      ? (formData.get('name') as string) || key
      : formData.name || key;
  const description
    = formData instanceof FormData
      ? (formData.get('description') as string) || `Setting for ${key}`
      : formData.description || `Setting for ${key}`;

  if (!key) {
    throw new Error('Setting key is required');
  }

  // Get the stringified value and ensure it's a string type
  const stringValue: string = stringifySettingValue(value);

  let setting = await prisma.settings.findUnique({
    where: { key },
    include: { systemValues: true },
  });

  if (!setting) {
    // Create the setting if it doesn't exist
    console.log(`Creating new setting with key '${key}'`);
    setting = await prisma.settings.create({
      data: {
        key,
        name,
        description,
        category: category as any,
        defaultValue: stringValue,
      },
      include: { systemValues: true },
    });
  }

  if (setting.systemValues.length > 0) {
    // Update existing system setting
    await prisma.systemSetting.update({
      where: { id: setting.systemValues[0].id },
      data: { value: stringValue },
    });
  } else {
    // Create new system setting
    await prisma.systemSetting.create({
      data: {
        settingId: setting.id,
        value: stringValue,
      },
    });
  }

  revalidatePath('/dashboard/settings');

  return { success: true };
}

/**
 * Get all settings for a specific category
 */
export async function getSettingsByCategory (category: SettingCategory): Promise<any[]> {
  // No authentication needed for reading settings in many cases

  const settings = await prisma.settings.findMany({
    where: { category: category as any },
    include: { systemValues: true },
  });

  if (settings.length === 0) {
    console.log(`No settings found for category ${category}`);
  }

  const result = [];

  for (const setting of settings) {
    const value
      = setting.systemValues && setting.systemValues.length > 0
        ? parseSettingValue(setting.systemValues[0].value)
        : parseSettingValue(setting.defaultValue || null);

    const defaultValue = parseSettingValue(setting.defaultValue || null);

    result.push({
      id: setting.id,
      key: setting.key,
      name: setting.name,
      description: setting.description,
      category: setting.category,
      value,
      defaultValue,
      hasCustomValue: setting.systemValues && setting.systemValues.length > 0,
    });
  }

  return result;
}

/**
 * Get all settings
 */
export async function getAllSettings (): Promise<any[]> {
  const settings = await prisma.settings.findMany({
    include: { systemValues: true },
  });

  const result = [];

  for (const setting of settings) {
    const value
      = setting.systemValues && setting.systemValues.length > 0
        ? parseSettingValue(setting.systemValues[0].value)
        : parseSettingValue(setting.defaultValue || null);

    const defaultValue = parseSettingValue(setting.defaultValue || null);

    result.push({
      id: setting.id,
      key: setting.key,
      name: setting.name,
      description: setting.description,
      category: setting.category,
      value,
      defaultValue,
      hasCustomValue: setting.systemValues && setting.systemValues.length > 0,
    });
  }

  return result;
}

/**
 * Get all route metadata entries
 */
export async function getAllRouteMetadata (): Promise<any[]> {
  await verifyAdminAccess();

  const routeMetadata = await prisma.routeMetadata.findMany({
    orderBy: {
      route: 'asc',
    },
  });

  return routeMetadata;
}

/**
 * Get metadata for a specific route
 */
export async function getRouteMetadata (route: string): Promise<any | null> {
  // Clean the route path to ensure consistent format
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;

  const metadata = await prisma.routeMetadata.findFirst({
    where: {
      route: normalizedRoute,
    },
  });

  // console.log(
  //   `Fetching metadata for route '${normalizedRoute}':`,
  //   metadata ? "Found" : "Not found"
  // );
  // console.log(metadata);

  return metadata;
}

/**
 * Save or update metadata for a specific route
 */
export async function saveRouteMetadata (formData:
    | FormData
    | {
        route: string;
        title: string;
        description: string;
      }) {
  await verifyAdminAccess();

  // Get form values
  const route
    = formData instanceof FormData
      ? (formData.get('route') as string)
      : formData.route;
  const title
    = formData instanceof FormData
      ? (formData.get('title') as string)
      : formData.title;
  const description
    = formData instanceof FormData
      ? (formData.get('description') as string)
      : formData.description;

  // Clean the route path to ensure consistent format
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;

  // Try to find existing route metadata
  const existingMetadata = await prisma.routeMetadata.findFirst({
    where: {
      route: normalizedRoute,
    },
  });

  if (existingMetadata) {
    // Update existing route metadata
    await prisma.routeMetadata.update({
      where: {
        id: existingMetadata.id,
      },
      data: {
        title,
        description,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new route metadata
    await prisma.routeMetadata.create({
      data: {
        route: normalizedRoute,
        title,
        description,
        isActive: true,
      },
    });
  }

  // Revalidate paths that might be affected
  revalidatePath('/dashboard/settings');
  revalidatePath(normalizedRoute);

  return { success: true };
}

/**
 * Delete metadata for a specific route
 */
export async function deleteRouteMetadata (routeId: string) {
  await verifyAdminAccess();

  const metadata = await prisma.routeMetadata.findUnique({
    where: {
      id: routeId,
    },
  });

  if (!metadata) {
    throw new Error('Route metadata not found');
  }

  await prisma.routeMetadata.delete({
    where: {
      id: routeId,
    },
  });

  // Revalidate paths that might be affected
  revalidatePath('/dashboard/settings');
  revalidatePath(metadata.route);

  return { success: true };
}

/**
 * Reset a setting to its default value
 */
export async function resetSetting (formData: FormData) {
  await verifyAdminAccess();

  const key = formData.get('key') as string;
  const scope = formData.get('scope') as SettingScope;
  const scopeId = formData.get('scopeId') as string | null;

  if (!key) {
    throw new Error('Setting key is required');
  }

  const setting = await prisma.settings.findUnique({
    where: { key },
  });

  if (!setting) {
    console.warn(`Setting with key '${key}' not found, nothing to reset`);

    return { success: true, message: 'Setting not found, nothing to reset' };
  }

  switch (scope) {
  case 'system':
    await prisma.systemSetting.deleteMany({
      where: { settingId: setting.id },
    });
    break;
  }

  revalidatePath('/dashboard/settings');

  return { success: true };
}

/**
 * Initialize default appearance settings if they don't exist
 */
export async function initializeAppearanceSettings (): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Default appearance settings
    const defaultAppearanceSettings = [
      {
        key: 'primary_color',
        name: 'Primary Color',
        description: 'Main brand color used for buttons and accents',
        value: '#000000',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'secondary_color',
        name: 'Secondary Color',
        description: 'Used for secondary buttons and elements',
        value: '#d6cd00',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'accent_color',
        name: 'Accent Color',
        description: 'Used for highlights and accents',
        value: '#fdf200',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'background_color',
        name: 'Background Color',
        description: 'Main background color',
        value: '#ffffff',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'text_color',
        name: 'Text Color',
        description: 'Main text color',
        value: '#171717',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'muted_color',
        name: 'Muted Color',
        description: 'Used for secondary text and disabled elements',
        value: '#737373',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'card_color',
        name: 'Card Color',
        description: 'Background color for cards and panels',
        value: '#f5f5f5',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'border_color',
        name: 'Border Color',
        description: 'Color used for borders and dividers',
        value: '#e5e5e5',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'font_family',
        name: 'Font Family',
        description: 'Main font family used throughout the application',
        value: 'GeistSans, sans-serif',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'brand_name',
        name: 'Brand Name',
        description: 'The name of your business or application',
        value: 'LML Repair',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'logo_url',
        name: 'Logo URL',
        description: 'URL to your logo image',
        value: '/logo.png',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'favicon_url',
        name: 'Favicon URL',
        description: 'URL to your favicon image',
        value: '/favicon.ico',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'site_description',
        name: 'Site Description',
        description: 'A brief description of your site for SEO purposes',
        value: 'Professional repair services for all your needs',
        category: SettingCategory.APPEARANCE,
      },
      {
        key: 'meta_title_template',
        name: 'Meta Title Template',
        description:
          'Template for page titles. Use %s for page name and {brand_name} for brand name',
        value: '%s | {brand_name}',
        category: SettingCategory.APPEARANCE,
      },
    ];

    // Check existing settings
    const existingSettings = await getSettingsByCategory(SettingCategory.APPEARANCE);
    const existingKeys = existingSettings.map((setting) => setting.key);

    // Initialize settings that don't exist yet
    let createdCount = 0;

    for (const setting of defaultAppearanceSettings) {
      if (!existingKeys.includes(setting.key)) {
        await setSystemSetting({
          key: setting.key,
          value: setting.value,
          category: setting.category,
          name: setting.name,
          description: setting.description,
        });
        createdCount++;
      }
    }

    revalidatePath('/dashboard/settings');

    return {
      success: true,
      message:
        createdCount > 0
          ? `Successfully initialized ${createdCount} appearance settings`
          : 'All appearance settings already exist',
    };
  } catch (error) {
    console.error('Error initializing appearance settings:', error);

    return {
      success: false,
      message: 'Failed to initialize appearance settings',
    };
  }
}
