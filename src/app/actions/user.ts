'use server';

import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { createCustomer } from '@/components/dashboard/customers/services/customerCrud';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { revalidatePath } from 'next/cache';

// Define validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  captcha?: string;
};

type RegisterResult = {
  success: boolean;
  message?: string;
  userId?: string;
};

export async function registerUser(
  data: RegisterData
): Promise<RegisterResult> {
  try {
    // Verify reCAPTCHA token if provided
    if (data.captcha) {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (!secretKey) {
        return {
          success: false,
          message: 'Server configuration error: Missing reCAPTCHA secret key',
        };
      }

      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${data.captcha}`;

      try {
        const captchaResponse = await fetch(verificationUrl, {
          method: 'POST',
        });

        if (!captchaResponse.ok) {
          return {
            success: false,
            message: `reCAPTCHA verification failed with status: ${captchaResponse.status}`,
          };
        }

        const captchaData = await captchaResponse.json();
        if (!captchaData.success || captchaData.score < 0.5) {
          return {
            success: false,
            message: 'reCAPTCHA verification failed. Please try again.',
          };
        }
      } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return {
          success: false,
          message: 'Failed to verify reCAPTCHA. Please try again later.',
        };
      }
    }

    // Check if user already exists
    const existingUser = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Account with this email already exists',
      };
    }

    // Create the customer record
    const newCustomer = await createCustomer({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: '',
      location: '',
    });

    return {
      success: true,
      userId: newCustomer.id,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

// Define shipping address schema
const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

type ShippingAddressResult = {
  success: boolean;
  message?: string;
  data?: any;
};

/**
 * Server action to get a customer's shipping address
 */
export async function getShippingAddress(
  customerId: string
): Promise<ShippingAddressResult> {
  try {
    // Verify the user is authenticated and authorized
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, message: 'Not authenticated' };
    }

    // Ensure users can only access their own data
    if (session.user.id !== customerId) {
      return { success: false, message: 'Unauthorized access' };
    }

    // Fetch the shipping address
    const shippingAddress = await prisma.shippingAddress.findUnique({
      where: {
        customerId: customerId,
      },
    });

    if (!shippingAddress) {
      return { success: false, message: 'No shipping address found' };
    }

    return { success: true, data: shippingAddress };
  } catch (error) {
    console.error('Error fetching shipping address:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to fetch shipping address',
    };
  }
}

/**
 * Server action to create a new shipping address
 */
export async function createShippingAddress(
  customerId: string,
  address: ShippingAddressInput
): Promise<ShippingAddressResult> {
  try {
    // Verify the user is authenticated and authorized
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, message: 'Not authenticated' };
    }

    // Ensure users can only access their own data
    if (session.user.id !== customerId) {
      return { success: false, message: 'Unauthorized access' };
    }

    // Check if the address already exists
    const existingAddress = await prisma.shippingAddress.findUnique({
      where: {
        customerId: customerId,
      },
    });

    if (existingAddress) {
      return {
        success: false,
        message:
          'Shipping address already exists. Use updateShippingAddress instead.',
      };
    }

    // Create the shipping address with required fields from the schema
    const shippingAddress = await prisma.shippingAddress.create({
      data: {
        customer: { connect: { id: customerId } },
        fullName: address.fullName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || null,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        phone: address.phone,
        shippingMethod: 'Standard', // Default shipping method
        shippingRate: 0, // Default shipping rate
      },
    });

    // Revalidate relevant paths
    revalidatePath('/checkout');

    return { success: true, data: shippingAddress };
  } catch (error) {
    console.error('Error creating shipping address:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to create shipping address',
    };
  }
}

/**
 * Server action to update an existing shipping address
 */
export async function updateShippingAddress(
  customerId: string,
  address: ShippingAddressInput
): Promise<ShippingAddressResult> {
  try {
    // Verify the user is authenticated and authorized
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, message: 'Not authenticated' };
    }

    // Ensure users can only access their own data
    if (session.user.id !== customerId) {
      return { success: false, message: 'Unauthorized access' };
    }

    // Check if the address exists
    const existingAddress = await prisma.shippingAddress.findUnique({
      where: {
        customerId: customerId,
      },
    });

    if (!existingAddress) {
      return {
        success: false,
        message:
          'Shipping address not found. Use createShippingAddress instead.',
      };
    }

    // Update the shipping address
    const updatedAddress = await prisma.shippingAddress.update({
      where: {
        customerId: customerId,
      },
      data: {
        fullName: address.fullName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || null,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        phone: address.phone,
      },
    });

    // Revalidate relevant paths
    revalidatePath('/checkout');

    return { success: true, data: updatedAddress };
  } catch (error) {
    console.error('Error updating shipping address:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to update shipping address',
    };
  }
}
