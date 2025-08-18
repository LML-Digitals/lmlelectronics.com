'use server';

import prisma from '@/lib/prisma';

/**
 * Fetch all reviews related to a staff member
 *
 * @param staffId ID of the staff member
 * @returns Array of reviews with related ticket and device information
 */
export async function getStaffReviews (staffId: string) {
  try {
    // Get all tickets handled by this staff member
    const staffTickets = await prisma.ticket.findMany({
      where: {
        staffId: staffId,
        status: 'DONE', // Only consider completed tickets
      },
      select: {
        id: true,
      },
    });

    const ticketIds = staffTickets.map((ticket) => ticket.id);

    // Get all reviews associated with these tickets
    const reviews = await prisma.review.findMany({
      where: {
        ticketId: {
          in: ticketIds,
        },
      },
      include: {
        reviewSource: true,
        ticket: {
          include: {
            repairDevices: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });

    return reviews;
  } catch (error) {
    console.error('Error fetching staff reviews:', error);
    throw error;
  }
}

/**
 * Update a review's approval status
 *
 * @param reviewId ID of the review
 * @param isApproved New approval status
 */
export async function updateReviewApproval (
  reviewId: number,
  isApproved: boolean,
) {
  try {
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        isApproved,
      },
    });

    return updatedReview;
  } catch (error) {
    console.error('Error updating review approval:', error);
    throw error;
  }
}
