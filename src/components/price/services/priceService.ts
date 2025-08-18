'use server';

import {
  PriceItem,
  PriceSearchParams,
  PriceSearchResult,
} from '../types/priceTypes';
import prisma from '@/lib/prisma';
import { RepairOption } from '@prisma/client';
import { Prisma } from '@prisma/client';

export type VendorAndItsInventoryItems = Prisma.VendorGetPayload<{
  include: { inventoryItems: true };
}>;

type RepairOptionProps = Prisma.RepairOptionGetPayload<{
  include: {
    repairType: true;
    model: {
      include: {
        series: {
          include: {
            brand: {
              include: {
                deviceType: true;
              };
            };
          };
        };
      };
    };
    variation: true;
  };
}>;

// Function to convert a repair to a price item
export async function repairToPriceItem (repair: RepairOptionProps): Promise<PriceItem> {
  const itemCost = (repair.price || 0) - (repair.labour || 0);
  const labour = repair.labour || 0;
  const finalPrice = repair.price;

  let detailedName = repair.name;

  let brandName = '';
  let seriesName = '';
  let modelName = '';
  let deviceTypeName = '';

  try {
    if (repair.model) {
      const model = repair.model;
      const series = model.series || {};
      const brand = series.brand || {};
      const deviceType = brand.deviceType;

      modelName = model.name || '';
      seriesName = series.name || '';
      brandName = brand.name || '';
      deviceTypeName = deviceType.name;

      if (modelName && brandName) {
        detailedName = `${repair.name} - ${modelName} (${brandName})`;
      } else if (modelName) {
        detailedName = `${repair.name} - ${modelName}`;
      }
    }
  } catch (err) {
    // If error occurs, just use the original name
  }

  return {
    id: repair.id,
    name: detailedName,
    imageUrl: repair.model?.image || '',
    type: 'repair',
    basePrice: itemCost,
    finalPrice: repair.price || 0,
    hasPromotion: false,
    description: repair.description || '',
    category: repair.repairType?.name || 'Repair',
    itemId: repair.id,
    labour,

    navigationInfo: {
      deviceTypeName,
      brandName,
      seriesName,
      modelName,
    },
  };
}

// Function to convert a product to a price item
export async function productToPriceItem (product: any): Promise<PriceItem> {
  const raw = product.raw || 0;
  const tax = product.tax || 0;
  const shipping = product.shipping || 0;
  const markup = product.markup || 0;
  const profit = product.profit || 0;

  const componentCost = raw + (raw * tax) / 100 + shipping;

  const finalPrice = product.sellingPrice;

  const category = product.inventoryItem?.categories?.[0]?.name || 'Product';

  return {
    id: product.id,
    name: product.name,
    type: 'product',
    basePrice: componentCost,
    finalPrice,
    hasPromotion: false,
    imageUrl: product.image,
    category,
    itemId: product.id,
    raw,
    tax,
    shipping,
    markup,
    profit,
    navigationInfo: {
      itemId: product.id,
      inventoryItemId: product.inventoryItemId,
      category,
    },
  };
}

// Search function for prices
export async function searchPrices (params: PriceSearchParams): Promise<PriceSearchResult> {
  const { query, type = 'all', category, minPrice, maxPrice, sort } = params;
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return { items: [], totalCount: 0, hasMore: false };
  }

  let items: PriceItem[] = [];

  // Search for repairs
  if (type === 'all' || type === 'repair') {
    try {
      const repairQuery: Prisma.RepairOptionFindManyArgs = {
        where: {
          OR: [
            { name: { contains: normalizedQuery } },
            { description: { contains: normalizedQuery } },
            {
              repairType: {
                name: { contains: normalizedQuery },
              },
            },
            // Add additional search criteria for model and brand
            {
              model: {
                name: { contains: normalizedQuery },
              },
            },
            {
              model: {
                series: {
                  name: { contains: normalizedQuery },
                },
              },
            },
            {
              model: {
                series: {
                  brand: {
                    name: { contains: normalizedQuery },
                  },
                },
              },
            },
          ],
        },
        include: {
          repairType: true,
          model: {
            include: {
              series: {
                include: {
                  brand: {
                    include: {
                      deviceType: true,
                    },
                  },
                },
              },
            },
          },
          variation: true, // Include the linked inventory variation
        },
        take: 50,
      };

      // Add sorting
      if (sort) {
        repairQuery.orderBy = [];

        switch (sort) {
        case 'price-asc':
          repairQuery.orderBy.push({ price: 'asc' });
          break;
        case 'price-desc':
          repairQuery.orderBy.push({ price: 'desc' });
          break;
        case 'name-asc':
          repairQuery.orderBy.push({ name: 'asc' });
          break;
        case 'name-desc':
          repairQuery.orderBy.push({ name: 'desc' });
          break;
        }
      }

      const repairs = await prisma.repairOption.findMany(repairQuery);

      console.log(repairs[0]);
      const repairItemPromises = repairs.map((repair) => repairToPriceItem(repair as RepairOptionProps));
      const repairItems = await Promise.all(repairItemPromises);

      items = [...items, ...repairItems];
    } catch (error) {
      console.error('Error searching for repairs:', error);
    }
  }

  // Search for products (inventory variations)
  if (type === 'all' || type === 'product') {
    try {
      const productQuery: any = {
        where: {
          OR: [
            { name: { contains: normalizedQuery } },
            { sku: { contains: normalizedQuery } },
            {
              inventoryItem: {
                name: { contains: normalizedQuery },
              },
            },
            {
              inventoryItem: {
                categories: {
                  some: {
                    name: { contains: normalizedQuery },
                  },
                },
              },
            },
          ],
          visible: true,
        },
        include: {
          inventoryItem: {
            include: {
              categories: true,
            },
          },
        },
        take: 50,
      };

      // Add price filtering if specified
      if (minPrice !== undefined || maxPrice !== undefined) {
        productQuery.where.AND = productQuery.where.AND || [];

        if (minPrice !== undefined) {
          productQuery.where.AND.push({
            sellingPrice: { gte: minPrice },
          });
        }

        if (maxPrice !== undefined) {
          productQuery.where.AND.push({
            sellingPrice: { lte: maxPrice },
          });
        }
      }

      // Add category filtering if specified
      if (category) {
        productQuery.where.AND = productQuery.where.AND || [];
        productQuery.where.AND.push({
          inventoryItem: {
            categories: {
              some: {
                name: category,
              },
            },
          },
        });
      }

      // Add sorting
      if (sort) {
        productQuery.orderBy = [];

        switch (sort) {
        case 'price-asc':
          productQuery.orderBy.push({ sellingPrice: 'asc' });
          break;
        case 'price-desc':
          productQuery.orderBy.push({ sellingPrice: 'desc' });
          break;
        case 'name-asc':
          productQuery.orderBy.push({ name: 'asc' });
          break;
        case 'name-desc':
          productQuery.orderBy.push({ name: 'desc' });
          break;
        }
      }

      const products = await prisma.inventoryVariation.findMany(productQuery);

      const productItemPromises = products.map((product) => productToPriceItem(product));
      const productItems = await Promise.all(productItemPromises);

      items = [...items, ...productItems];
    } catch (error) {
      console.error('Error searching for products:', error);
    }
  }

  // Sort the combined results client-side by finalPrice if needed
  if (sort) {
    switch (sort) {
    case 'price-asc':
      items.sort((a, b) => a.finalPrice - b.finalPrice);
      break;
    case 'price-desc':
      items.sort((a, b) => b.finalPrice - a.finalPrice);
      break;
    case 'name-asc':
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      items.sort((a, b) => b.name.localeCompare(a.name));
      break;
    }
  }

  return {
    items,
    totalCount: items.length,
    hasMore: false, // In real implementation, this would be determined by the total count and page size
  };
}

// Function to get repair details
export async function getRepairDetails (id: string): Promise<any | null> {
  try {
    const repair = await prisma.repairOption.findUnique({
      where: { id },
      include: {
        repairType: true,
        model: {
          include: {
            series: {
              include: {
                brand: {
                  include: {
                    deviceType: true,
                  },
                },
              },
            },
          },
        },
        variation: true, // Include the linked inventory variation
      },
    });

    return repair;
  } catch (error) {
    console.error('Error fetching repair details:', error);

    return null;
  }
}

// Function to get product details
export async function getProductDetails (id: string): Promise<any | null> {
  try {
    const product = await prisma.inventoryVariation.findUnique({
      where: { id },
      include: {
        inventoryItem: {
          include: {
            categories: true,
            supplier: true,
          },
        },
        stockLevels: {
          include: {
            location: true,
          },
        },
      },
    });

    return product;
  } catch (error) {
    console.error('Error fetching product details:', error);

    return null;
  }
}

// Function to apply discount to price
export async function applyDiscount (
  basePrice: number,
  discount: { value?: number; percentage?: number },
): Promise<{
  finalPrice: number;
  discountAmount: number;
  discountPercentage?: number;
}> {
  let discountAmount = 0;
  let discountPercentage;

  if (discount.value) {
    // Fixed amount discount
    discountAmount = discount.value;
  } else if (discount.percentage) {
    // Percentage discount
    discountPercentage = discount.percentage;
    discountAmount = (basePrice * discount.percentage) / 100;
  }

  // Calculate final price (cannot be less than 0)
  const finalPrice = Math.max(0, basePrice - discountAmount);

  return {
    finalPrice,
    discountAmount,
    discountPercentage,
  };
}
