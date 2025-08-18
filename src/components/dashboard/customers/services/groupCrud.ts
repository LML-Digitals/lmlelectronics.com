'use server';

import prisma from '@/lib/prisma';
import {
  Customer,
  CustomerGroup,
  CustomerGroupMembership,
  Prisma,
} from '@prisma/client';

export type FilterOperator = 'greaterThan' | 'lessThan' | 'between' | 'equalTo';

export type FilterCriterion = {
  field: string;
  operator: FilterOperator;
  value: any;
  valueEnd?: any; // For "between" operator
};

export type SmartGroupFilters = {
  criteria: FilterCriterion[];
  conjunction: 'AND' | 'OR';
};

export const createGroup = async (data: {
  name: string;
  description?: string;
  color?: string;
  isSmartGroup?: boolean;
  filterCriteria?: SmartGroupFilters;
}) => {
  try {
    const group = await prisma.customerGroup.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        isSmartGroup: data.isSmartGroup || false,
        filterCriteria: data.filterCriteria
          ? (data.filterCriteria as any)
          : undefined,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    // If it's a smart group, immediately populate it with matching customers
    if (data.isSmartGroup && data.filterCriteria) {
      await updateSmartGroupMembers(group.id);
    }

    return group;
  } catch (error) {
    console.error('Error creating group:', error);
    throw new Error('Failed to create group');
  }
};

export const updateGroup = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
    isSmartGroup?: boolean;
    filterCriteria?: SmartGroupFilters;
  },
) => {
  try {
    const group = await prisma.customerGroup.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    // If it's a smart group, update its members based on the criteria
    if (group.isSmartGroup && data.filterCriteria) {
      await updateSmartGroupMembers(id);
    }

    return group;
  } catch (error) {
    console.error('Error updating group:', error);
    throw new Error('Failed to update group');
  }
};

export const deleteGroup = async (id: string) => {
  try {
    await prisma.customerGroup.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    throw new Error('Failed to delete group');
  }
};

export const getGroups = async () => {
  try {
    const groups = await prisma.customerGroup.findMany({
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!groups) {
      throw new Error('No groups found');
    }

    return groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw new Error('Failed to fetch groups');
  }
};

export const addCustomersToGroup = async (
  groupIds: string[],
  customerIds: string[],
) => {
  try {
    const data = [];

    for (const groupId of groupIds) {
      // Check if the group is a smart group
      const group = await prisma.customerGroup.findUnique({
        where: { id: groupId },
        select: { isSmartGroup: true },
      });

      if (group?.isSmartGroup) {
        console.warn('Cannot manually add customers to a smart group');
        continue;
      }

      for (const customerId of customerIds) {
        data.push({ groupId, customerId });
      }
    }

    if (data.length > 0) {
      await prisma.customerGroupMembership.createMany({
        data,
        skipDuplicates: true,
      });
    }
  } catch (error) {
    console.error('Error adding customers to group:', error);
    throw new Error('Failed to add customers to group');
  }
};

export const removeCustomersFromGroup = async (
  groupId: string,
  customerIds: string[],
) => {
  try {
    // Check if the group is a smart group
    const group = await prisma.customerGroup.findUnique({
      where: { id: groupId },
      select: { isSmartGroup: true },
    });

    if (group?.isSmartGroup) {
      throw new Error('Cannot manually remove customers from a smart group');
    }

    await prisma.customerGroupMembership.deleteMany({
      where: {
        groupId,
        customerId: {
          in: customerIds,
        },
      },
    });
  } catch (error) {
    console.error('Error removing customers from group:', error);
    throw new Error('Failed to remove customers from group');
  }
};

export const getGroupMembers = async (groupId: string) => {
  try {
    return await prisma.customer.findMany({
      where: {
        groups: {
          some: {
            groupId,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw new Error('Failed to fetch group members');
  }
};

export const getCustomerGroups = async (customerId: string) => {
  try {
    return await prisma.customerGroup.findMany({
      where: {
        members: {
          some: {
            customerId,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching customer groups:', error);
    throw new Error('Failed to fetch customer groups');
  }
};

export const removeCustomerFromGroup = async (
  groupId: string,
  customerId: string,
) => {
  try {
    // Check if the group is a smart group
    const group = await prisma.customerGroup.findUnique({
      where: { id: groupId },
      select: { isSmartGroup: true },
    });

    if (group?.isSmartGroup) {
      throw new Error('Cannot manually remove customers from a smart group');
    }

    await prisma.customerGroupMembership.delete({
      where: {
        groupId_customerId: {
          groupId,
          customerId,
        },
      },
    });
  } catch (error) {
    console.error('Error removing customer from group:', error);
    throw new Error('Failed to remove customer from group');
  }
};

// New function to build a Prisma query from filter criteria
const buildFilterQuery = (filters: SmartGroupFilters) => {
  const conditions = filters.criteria.map((criterion) => {
    const { field, operator, value, valueEnd } = criterion;

    // Map the field to the appropriate database field
    let dbField = field;

    if (field === 'totalSpent') { dbField = 'totalSpent'; } else if (field === 'transactionCount') { dbField = 'transactionCount'; } else if (field === 'lastVisit') { dbField = 'lastVisit'; } else if (field === 'firstVisit') { dbField = 'createdAt'; }

    switch (operator) {
    case 'greaterThan':
      return { [dbField]: { gt: value } };
    case 'lessThan':
      return { [dbField]: { lt: value } };
    case 'equalTo':
      return { [dbField]: value };
    case 'between':
      return {
        AND: [
          { [dbField]: { gte: value } },
          { [dbField]: { lte: valueEnd } },
        ],
      };
    default:
      return {};
    }
  });

  // Combine conditions with AND or OR
  if (filters.conjunction === 'OR') {
    return { OR: conditions };
  }

  return { AND: conditions };
};

// Function to update smart group members based on criteria
export const updateSmartGroupMembers = async (groupId: string) => {
  try {
    const group = await prisma.customerGroup.findUnique({
      where: { id: groupId },
      select: { filterCriteria: true, isSmartGroup: true },
    });

    if (!group || !group.isSmartGroup || !group.filterCriteria) {
      throw new Error('Not a valid smart group or missing filter criteria');
    }

    // Parse the filter criteria
    const filters = group.filterCriteria as SmartGroupFilters;

    // Build the query
    const whereClause = buildFilterQuery(filters);

    // Find matching customers
    const matchingCustomers = await prisma.customer.findMany({
      where: whereClause,
      select: { id: true },
    });

    const customerIds = matchingCustomers.map((c) => c.id);

    // First, remove all existing memberships
    await prisma.customerGroupMembership.deleteMany({
      where: { groupId },
    });

    // Then add the new matching customers
    if (customerIds.length > 0) {
      const memberships = customerIds.map((customerId) => ({
        groupId,
        customerId,
      }));

      await prisma.customerGroupMembership.createMany({
        data: memberships,
        skipDuplicates: true,
      });
    }

    return customerIds.length;
  } catch (error) {
    console.error('Error updating smart group members:', error);
    throw new Error('Failed to update smart group members');
  }
};

// Function to update all smart groups
export const updateAllSmartGroups = async () => {
  try {
    const smartGroups = await prisma.customerGroup.findMany({
      where: { isSmartGroup: true },
      select: { id: true },
    });

    for (const group of smartGroups) {
      await updateSmartGroupMembers(group.id);
    }

    return smartGroups.length;
  } catch (error) {
    console.error('Error updating all smart groups:', error);
    throw new Error('Failed to update all smart groups');
  }
};

export const getGroupsWithMembers = async () => {
  try {
    const groupsWithMembers = await prisma.customerGroup.findMany({
      include: {
        members: {
          include: {
            customer: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!groupsWithMembers) {
      throw new Error('No groups found');
    }

    return groupsWithMembers;
  } catch (error) {
    console.error('Error fetching groups with members:', error);
    throw new Error('Failed to fetch groups with members');
  }
};
