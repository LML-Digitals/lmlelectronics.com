'use server';

import { PrismaClient, TermVersion } from '@prisma/client';
import { TermWithVersions } from '@/lib/types';
import { fetchSession } from '@/lib/session';

const prisma = new PrismaClient();

// Generate a slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Fetch all terms with their latest version
export const getTerms = async () => {
  try {
    return await prisma.terms.findMany({
      include: {
        versions: {
          orderBy: [{ isActive: 'desc' }, { lastUpdated: 'desc' }],
          take: 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching terms:', error);
    throw new Error('Failed to fetch terms');
  }
};

// Fetch a single term by ID with all its versions
export const getActiveTermById = async (termId: number) => {
  try {
    return await prisma.terms.findUnique({
      where: { id: termId },
      include: {
        versions: {
          where: { isActive: true },
          orderBy: { lastUpdated: 'desc' },
          take: 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching term:', error);
    throw new Error('Failed to fetch term');
  }
};

// Fetch a single term by slug with its active version
export const getActiveTermsBySlug = async (slug: string) => {
  try {
    const term = await prisma.terms.findUnique({
      where: { slug },
      include: {
        versions: {
          where: { isActive: true },
          orderBy: { lastUpdated: 'desc' },
          take: 1,
        },
      },
    });

    if (!term) {
      throw new Error('Term not found');
    }

    return term;
  } catch (error) {
    console.error('Error fetching term by slug:', error);
    throw new Error('Failed to fetch term by slug');
  }
};

export const getTermsBySlug = async (slug: string) => {
  try {
    const term = await prisma.terms.findUnique({
      where: { slug },
      include: {
        versions: {
          orderBy: { lastUpdated: 'desc' },
          take: 1,
        },
      },
    });

    if (!term) {
      throw new Error('Term not found');
    }

    return term;
  } catch (error) {
    console.error('Error fetching term by slug:', error);
    throw new Error('Failed to fetch term by slug');
  }
};

// Get all versions of a term
export const getTermVersions = async (
  termId: number
): Promise<TermVersion[]> => {
  try {
    const term = await prisma.terms.findUnique({
      where: { id: termId },
      include: { versions: true },
    });
    return term?.versions || [];
  } catch (error) {
    console.error('Error fetching term versions:', error);
    throw new Error('Failed to fetch term versions');
  }
};

// Fetch all active terms with their active versions
export const getActiveTerms = async () => {
  try {
    return await prisma.termVersion.findMany({
      where: { isActive: true },
      include: { terms: { select: { id: true, title: true, slug: true } } },
    });
  } catch (error) {
    console.error('Error fetching active terms:', error);
    throw new Error('Failed to fetch active terms');
  }
};

// Create a new term with an initial version
export const createTerm = async (termData: {
  title: string;
  content: string;
  version: string;
  effectiveAt: Date;
}) => {
  try {
    const session = await fetchSession();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Verify staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: String(session.user.id) },
    });

    if (!staff) {
      throw new Error('Invalid author ID');
    }

    const slug = generateSlug(termData.title);

    // Ensure the generated slug is unique
    const existingTerm = await prisma.terms.findUnique({
      where: { slug },
    });

    if (existingTerm) {
      throw new Error('Term with this title already exists');
    }

    return await prisma.terms.create({
      data: {
        title: termData.title,
        slug,
        versions: {
          create: {
            content: termData.content,
            version: termData.version,
            effectiveAt: termData.effectiveAt,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error creating term:', error);
    throw new Error('Failed to create term');
  }
};

// Add a new version to an existing term
export const addTermVersion = async (
  termId: number,
  versionData: {
    content: string;
    version: string;
    effectiveAt: Date;
  }
) => {
  try {
    // Check if the version already exists for the given termId
    const existingVersion = await prisma.termVersion.findFirst({
      where: {
        termsId: termId,
        version: versionData.version,
      },
    });

    if (existingVersion) {
      throw new Error(
        `Version ${versionData.version} already exists for term ${termId}`
      );
    }

    // Create a new version
    return await prisma.termVersion.create({
      data: {
        termsId: termId,
        ...versionData,
      },
    });
  } catch (error) {
    console.error('Error adding term version:', error);
    throw new Error('Failed to add term version');
  }
};

// Activate a specific version of a term
export const activateVersion = async (versionId: number) => {
  try {
    const version = await prisma.termVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      throw new Error('Version not found');
    }

    await prisma.$transaction([
      prisma.termVersion.updateMany({
        where: { termsId: version.termsId },
        data: { isActive: false },
      }),
      prisma.termVersion.update({
        where: { id: versionId },
        data: { isActive: true },
      }),
    ]);
  } catch (error) {
    console.error('Error activating version:', error);
    throw new Error('Failed to activate version');
  }
};

// Deactivate a specific version of a term
export const deactivateTermVersion = async (
  termId: number,
  version: string
) => {
  try {
    return await prisma.termVersion.updateMany({
      where: { termsId: termId, version },
      data: { isActive: false },
    });
  } catch (error) {
    console.error('Error deactivating term version:', error);
    throw new Error('Failed to deactivate term version');
  }
};

// Fetch all versions of a term
export const getTermHistory = async (slug: string) => {
  try {
    return await prisma.terms.findUnique({
      where: { slug: slug },
      include: {
        versions: {
          orderBy: { lastUpdated: 'desc' },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching term history:', error);
    throw new Error('Failed to fetch term history');
  }
};

// Mark terms as accepted by a customer
export const markTermsAsAccepted = async (
  customerId: string,
  termId: number,
  versionId: number
) => {
  try {
    await prisma.customerTermsAcceptance.create({
      data: {
        customerId,
        termsId: termId,
        versionId,
      },
    });
  } catch (error) {
    console.error('Error marking terms as accepted:', error);
    throw new Error('Failed to record terms acceptance');
  }
};

// Update an existing term (only updates the term metadata, not versions)
export const updateTerm = async (
  termId: number,
  updatedData: {
    title?: string;
  }
) => {
  try {
    let slug: string | undefined;

    if (updatedData.title) {
      slug = generateSlug(updatedData.title);
      const isSlugUnique = await prisma.terms.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (isSlugUnique && isSlugUnique.id !== termId) {
        slug = `${slug}-${termId}`;
      }
    }

    return await prisma.terms.update({
      where: { id: termId },
      data: {
        ...updatedData,
        ...(slug && { slug }),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating term:', error);
    throw new Error('Failed to update term');
  }
};

// Delete a term and all its versions
export const deleteTerm = async (termId: number) => {
  try {
    // Delete all versions associated with the term
    await prisma.termVersion.deleteMany({
      where: { termsId: termId },
    });

    // Delete the term itself
    return await prisma.terms.delete({
      where: { id: termId },
    });
  } catch (error) {
    console.error('Error deleting term:', error);
    throw new Error('Failed to delete term');
  }
};
