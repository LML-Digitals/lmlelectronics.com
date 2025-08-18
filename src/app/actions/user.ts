'use server';

import prisma from '@/lib/prisma';
import { createCustomer } from '@/components/dashboard/customers/services/customerCrud';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { revalidatePath } from 'next/cache';

// Define validation schema
const _registerSchema = z.object({
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

export async function registerUser (data: RegisterData): Promise<RegisterResult> {
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
      } catch (_error) {
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
      message: 'Account created successfully',
      userId: newCustomer.id,
    };
  } catch (_error) {
    return {
      success: false,
      message: 'Failed to create account. Please try again.',
    };
  }
}

// Define shipping address validation schema
const _shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  shippingRate: z.number().min(0, 'Shipping rate must be non-negative'),
});

type ShippingAddressData = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  shippingMethod: string;
  shippingRate: number;
};

export async function updateShippingAddress (
  customerId: string,
  addressData: ShippingAddressData,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    // Check if customer exists and belongs to the authenticated user
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        email: session.user.email,
      },
    });

    if (!customer) {
      return {
        success: false,
        message: 'Customer not found or access denied',
      };
    }

    // Update or create shipping address
    await prisma.shippingAddress.upsert({
      where: {
        customerId: customer.id,
      },
      update: {
        fullName: addressData.fullName,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        phone: addressData.phone,
        shippingMethod: addressData.shippingMethod,
        shippingRate: addressData.shippingRate,
      },
      create: {
        customerId: customer.id,
        fullName: addressData.fullName,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        phone: addressData.phone,
        shippingMethod: addressData.shippingMethod,
        shippingRate: addressData.shippingRate,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/checkout');

    return {
      success: true,
      message: 'Shipping address updated successfully',
    };
  } catch (_error) {
    return {
      success: false,
      message: 'Failed to update shipping address',
    };
  }
}

export async function getCustomerProfile (customerId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        email: session.user.email,
      },
      include: {
        shippingAddress: true,
      },
    });

    if (!customer) {
      return {
        success: false,
        message: 'Customer not found or access denied',
      };
    }

    return {
      success: true,
      data: customer,
    };
  } catch (_error) {
    return {
      success: false,
      message: 'Failed to fetch customer profile',
    };
  }
}

export async function updateCustomerProfile (
  customerId: string,
  updateData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
  },
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    // Check if customer exists and belongs to the authenticated user
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        email: session.user.email,
      },
    });

    if (!customer) {
      return {
        success: false,
        message: 'Customer not found or access denied',
      };
    }

    // Update customer profile
    await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: updateData,
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (_error) {
    return {
      success: false,
      message: 'Failed to update profile',
    };
  }
}
