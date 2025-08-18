'use server';
import prisma from '@/lib/prisma';
import type {
  Customer,
  StoreCredit,
  Ticket,
  LoyaltyProgram,
} from '@prisma/client';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

// const emailService = new EmailService();
import { getOfficeEmail } from '../utils/getOfficeEmail';
import { generatePassword } from '@/utils/generatePassword';
import { addCustomersToGroup } from './groupCrud';

type CustomerWithTickets = Customer & {
  tickets: Ticket[];
  storeCredit: StoreCredit | null;
  loyalty: LoyaltyProgram | null;
};

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    return await prisma.customer.findMany({
      include: {
        tickets: true,
        groups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
};

export const getCustomersForLoyalty = async () => {
  try {
    return await prisma.customer.findMany({
      include: {
        loyalty: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
};

export async function createCustomer (
  data: Partial<Customer> & { groups?: string[] },
  message?: string,
) {
  try {
    // Extract groups from data to handle separately *before* the transaction
    const { groups, ...customerData } = data;

    // Generate temporary password if none provided
    const tempPassword = !customerData.password
      ? generatePassword()
      : undefined;
    const passwordToUse = customerData.password || tempPassword;

    if (!passwordToUse) {
      throw new Error('Password generation failed');
    }

    // Check if the customer email already exists first
    if (customerData.email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: customerData.email },
      });

      if (existingCustomer) {
        throw new Error(`A customer with email ${customerData.email} already exists. Please use a different email or update the existing customer.`);
      }
    }

    const hashedPassword = await bcrypt.hash(passwordToUse, 10);
    const officeEmail = getOfficeEmail(customerData.location || undefined);

    // Transaction for creating customer and handling referrals
    const result = await prisma.$transaction(async (tx) => {
      let createdCustomer: Customer;
      const referralApplied = false;
      const signupDiscount = 0;

      // Handle referral code if provided (customer was referred by someone)
      if (
        customerData.referralCode
        && customerData.referralCode.trim() !== ''
      ) {
        try {
          // Apply the referral code using our new system
          // const referralResult = await applyReferralCode({
          //   referralCode: customerData.referralCode,
          //   refereeEmail: customerData.email!,
          //   refereeName: `${customerData.firstName} ${customerData.lastName}`,
          //   refereePhone: customerData.phone || undefined,
          //   discountAmount: 10, // $10 discount for friend
          //   rewardAmount: 20, // $20 reward for referrer
          // });

          // if (referralResult.success) {
          //   referralApplied = true;
          //   signupDiscount = 10; // $10 discount for being referred
          // }
        } catch (error) {
          console.error('Error applying referral code:', error);
          // Continue with customer creation even if referral fails
        }
      }

      // Create the customer
      createdCustomer = await tx.customer.create({
        data: {
          ...customerData,
          firstName: customerData.firstName!,
          lastName: customerData.lastName!,
          email: customerData.email!,
          phone: customerData.phone ?? null,
          password: hashedPassword,
          pendingDiscount: signupDiscount,
          location: customerData.location,
          city: customerData.city,
          state: customerData.state,
          zip: customerData.zip,
          company: customerData.company,
          totalSpent: customerData.totalSpent,
          birthDay: customerData.birthDay,
          isActive: true,
        },
      });

      // Generate a unique referral code for the new customer
      let newCustomerReferralCode = `REF-${nanoid(6).toUpperCase()}`;
      let isUnique = false;

      while (!isUnique) {
        const existingCode = await tx.referralCode.findUnique({
          where: { code: newCustomerReferralCode },
        });

        if (!existingCode) {
          isUnique = true;
        } else {
          newCustomerReferralCode = `REF-${nanoid(6).toUpperCase()}`;
        }
      }

      // Create referral code record for the new customer
      await tx.referralCode.create({
        data: {
          code: newCustomerReferralCode,
          customerId: createdCustomer.id,
          customerEmail: createdCustomer.email,
          customerName: `${createdCustomer.firstName} ${createdCustomer.lastName}`,
          isActive: true,
        },
      });

      // Update customer with their referral code for backward compatibility
      createdCustomer = await tx.customer.update({
        where: { id: createdCustomer.id },
        data: { referralCode: newCustomerReferralCode },
      });

      return { createdCustomer, referralApplied, signupDiscount };
    });

    const { createdCustomer, referralApplied, signupDiscount } = result;

    // Add customer to groups if specified (after transaction)
    if (groups && groups.length > 0 && createdCustomer) {
      for (const groupId of groups) {
        await addCustomersToGroup([groupId], [createdCustomer.id]);
      }
    }

    // Create loyalty entry
    // await createCustomerLoyalty(
    //   createdCustomer.id,
    //   createdCustomer.referralCode!
    // );

    // Build the welcome email content
    const emailSubject = 'Welcome to LML Repair!';
    let emailContent = `
      <h1>Welcome to LML Repair!</h1>
      <p>Thank you for signing up, ${createdCustomer.firstName} ${createdCustomer.lastName}!</p>
      <p>Your unique referral code is: <strong>${createdCustomer.referralCode}</strong></p>
      <p>Share this code with your friends and family to give them $10 off their first repair, and you'll earn $20 for each successful referral!</p>
    `;

    // Include temporary password in email if one was generated
    if (tempPassword) {
      emailContent += `
        <p>Your temporary password is: <strong>${tempPassword}</strong></p>
        <p>Please change this password after your first login.</p>
      `;
    }

    if (referralApplied && signupDiscount > 0) {
      emailContent += `
        <p>🎉 Great news! You've received a $${signupDiscount} discount on your first repair for using a referral code!</p>
      `;
    }

    emailContent += `
      <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h3>How Referrals Work:</h3>
        <ul>
          <li>🎁 Your friends get $10 off their first repair</li>
          <li>💰 You earn $20 when their repair is completed</li>
          <li>🔄 No limits - refer as many people as you want!</li>
        </ul>
      </div>
      <p>We look forward to serving you!</p>
      <p>Best regards,<br>The LML Repair Team</p>
    `;

    // await emailService.sendEmail({
    //   to: createdCustomer.email,
    //   subject: emailSubject,
    //   content: emailContent,
    //   customerId: createdCustomer.id,
    //   emailType: "TRANSACTIONAL"
    // });

    // If a message is passed, send an additional email to the office email.
    if (message) {
      const messageSubject = 'New Customer Message';
      const messageContent = `
        <h1>New Customer Message</h1>
        <p>Customer <strong>${createdCustomer.firstName} ${
  createdCustomer.lastName
}</strong> (${createdCustomer.email}) sent the following message:</p>
        <p>${message}</p>
        ${
  referralApplied
    ? `<p><em>Note: This customer was referred and received a $${signupDiscount} discount.</em></p>`
    : ''
}
      `;
      // await emailService.sendEmail({
      //   to: officeEmail,
      //   subject: messageSubject,
      //   content: messageContent,
      //   emailType: "MANUAL"
      // });
    }

    return createdCustomer;
  } catch (error) {
    console.error('Error creating customer:', error);
    // Provide more detailed error message
    if (error instanceof Error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
    throw new Error('Failed to create customer');
  }
}

export const updateCustomer = async (
  id: string,
  data: Partial<Customer> & { groups?: string[] },
) => {
  try {
    // Extract groups from data to handle separately
    const { groups, ...customerData } = data;

    if (customerData.password) {
      const hashedPassword = await bcrypt.hash(customerData.password, 10);

      customerData.password = hashedPassword;
    } else {
      delete customerData.password;
    }

    // Update customer data
    const customer = await prisma.customer.update({
      where: { id },
      data: customerData,
    });

    // Handle group memberships if provided
    if (groups && groups.length > 0) {
      // First remove all existing group memberships
      await prisma.customerGroupMembership.deleteMany({
        where: { customerId: id },
      });

      // Then add the new group memberships
      await prisma.customerGroupMembership.createMany({
        data: groups.map((groupId) => ({
          customerId: id,
          groupId,
        })),
        skipDuplicates: true,
      });
    }

    return customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new Error('Failed to update customer');
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    await prisma.$transaction(async (tx) => {
      // Delete loyalty program first
      // await tx.loyaltyProgram.deleteMany({
      //   where: { customerId: id },
      // });

      // Then delete the customer
      await tx.customer.delete({
        where: { id },
      });
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete customer');
  }
};

export const getReferral = async (referralCode: string): Promise<Customer | null> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { referralCode },
    });

    return customer;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw new Error('Failed to fetch customer');
  }
};

export const getCustomer = async (
  email?: string,
  location?: string,
  id?: string,
): Promise<CustomerWithTickets | null> => {
  try {
    const where: any = {};

    if (email) { where.email = email; }
    if (location) { where.location = location; }
    if (id) { where.id = id; }

    return (await prisma.customer.findFirst({
      where,
      include: {
        tickets: true,
        storeCredit: true,
        loyalty: true,
      },
    })) as CustomerWithTickets | null;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
};

export const createBulkCustomer = async (data: Omit<Customer, 'id'>[]) => {
  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.customer.createMany({ data });
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating customers:', error);
    throw new Error('Failed to create customers');
  } finally {
    await prisma.$disconnect();
  }
};

export const getCustomersByLocation = async (location: string): Promise<{ email: string }[]> => {
  try {
    return await prisma.customer.findMany({
      where: { location },
    });
  } catch (error) {
    console.error('Error fetching customers by location:', error);
    throw new Error('Failed to fetch customers by location');
  }
};

export async function generateReferralCode (customerId: string): Promise<string> {
  try {
    // Generate a unique referral code using our new format
    let referralCode = `REF-${nanoid(6).toUpperCase()}`;
    let isUnique = false;

    while (!isUnique) {
      const existingCode = await prisma.referralCode.findUnique({
        where: { code: referralCode },
      });

      if (!existingCode) {
        isUnique = true;
      } else {
        referralCode = `REF-${nanoid(6).toUpperCase()}`;
      }
    }

    // Get customer info
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if customer already has a referral code
    const existingReferralCode = await prisma.referralCode.findFirst({
      where: { customerId },
    });

    if (existingReferralCode) {
      // Update existing referral code
      await prisma.referralCode.update({
        where: { id: existingReferralCode.id },
        data: {
          code: referralCode,
          isActive: true,
        },
      });
    } else {
      // Create new referral code
      await prisma.referralCode.create({
        data: {
          code: referralCode,
          customerId,
          customerEmail: customer.email,
          customerName: `${customer.firstName} ${customer.lastName}`,
          isActive: true,
        },
      });
    }

    // Update the customer with the new referral code for backward compatibility
    await prisma.customer.update({
      where: { id: customerId },
      data: { referralCode },
    });

    return referralCode;
  } catch (error) {
    console.error('Error generating referral code:', error);
    throw new Error('Failed to generate referral code');
  }
}

export async function updateCustomerReferralCode (
  customerId: string,
  referralCode: string,
) {
  try {
    // Check if the referral code is already in use
    const existingCode = await prisma.referralCode.findUnique({
      where: { code: referralCode },
    });

    if (existingCode && existingCode.customerId !== customerId) {
      throw new Error('Referral code already in use');
    }

    // Get customer info
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if customer already has a referral code
    const existingReferralCode = await prisma.referralCode.findFirst({
      where: { customerId },
    });

    if (existingReferralCode) {
      // Update existing referral code
      await prisma.referralCode.update({
        where: { id: existingReferralCode.id },
        data: {
          code: referralCode,
          isActive: true,
        },
      });
    } else {
      // Create new referral code
      await prisma.referralCode.create({
        data: {
          code: referralCode,
          customerId,
          customerEmail: customer.email,
          customerName: `${customer.firstName} ${customer.lastName}`,
          isActive: true,
        },
      });
    }

    // Update the customer's referral code for backward compatibility
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { referralCode },
    });

    return updatedCustomer;
  } catch (error) {
    console.error('Error updating referral code:', error);
    throw error;
  }
}

export async function updateCustomerTotalSpent (
  customerId: string,
  amount: number,
): Promise<void> {
  try {
    // Get current customer to handle null totalSpent case
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { totalSpent: true },
    });

    // Calculate new totalSpent (handle case where current totalSpent might be null)
    const currentTotal = customer?.totalSpent || 0;
    const newTotal = currentTotal + amount;

    // Update customer record with new totalSpent
    await prisma.customer.update({
      where: { id: customerId },
      data: { totalSpent: newTotal },
    });
  } catch (error) {
    console.error("Error updating customer's total spent:", error);
    throw new Error("Failed to update customer's total spent");
  }
}

// Function to toggle the active status of a customer
export const toggleCustomerActiveStatus = async (
  customerId: string,
  isActive: boolean,
): Promise<Customer> => {
  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { isActive },
    });

    return updatedCustomer;
  } catch (error) {
    console.error('Error toggling customer active status:', error);
    throw new Error('Failed to update customer status');
  }
};

// Function to get customers for selection in group UI
export const getCustomersForGroupSelection = async (search?: string) => {
  try {
    let whereClause = {};

    if (search) {
      whereClause = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      take: 50, // Limit results for performance
    });

    return customers;
  } catch (error) {
    console.error('Error fetching customers for selection:', error);

    return [];
  }
};

export const getBasicCustomers = async (): Promise<
  { id: string; firstName: string; lastName: string; email: string }[]
> => {
  try {
    return await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  } catch (error) {
    console.error('Error fetching basic customer data:', error);
    throw new Error('Failed to fetch customers');
  }
};
