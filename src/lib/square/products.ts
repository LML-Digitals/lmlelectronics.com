import { squareClient, SQUARE_LOCATION_ID } from "./client";
import {
  Product,
  ProductSearchResult,
  ProductSearchFilters,
  createSlug,
} from "@/types/product";
import { SquareCategory } from "@/types/square";

/**
 * Get all categories from Square Catalog API
 */
export async function getCategories(): Promise<SquareCategory[]> {
  try {
    const response = await squareClient.catalog.search({
      objectTypes: ["CATEGORY"],
      includeDeletedObjects: false,
      includeRelatedObjects: false,
    });

    if (!response || !response.objects) {
      console.error("Failed to fetch categories");
      return [];
    }

    return response.objects
      .filter((obj: any) => obj.type === "CATEGORY")
      .map((obj: any) => ({
        id: obj.id || "",
        categoryData: {
          name: obj.categoryData?.name || "Unnamed Category",
          abbreviation: obj.categoryData?.abbreviation,
        },
        updatedAt: obj.updatedAt,
        version: obj.version,
        isDeleted: obj.isDeleted || false,
        presentAtAllLocations: obj.presentAtAllLocations || false,
        presentAtLocationIds: obj.presentAtLocationIds || [],
      }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Get products with optional filters (alias for searchProducts for compatibility)
 */
export async function getProducts(
  filters: ProductSearchFilters = {}
): Promise<ProductSearchResult> {
  return await searchProducts(filters);
}

/**
 * Get category by ID
 */
export async function getCategoryById(
  categoryId: string
): Promise<SquareCategory | null> {
  try {
    // Use search to find specific category by ID
    const response = await squareClient.catalog.search({
      objectTypes: ["CATEGORY"],
      includeDeletedObjects: false,
      includeRelatedObjects: false,
    });

    if (!response || !response.objects) {
      return null;
    }

    const category = response.objects.find((obj: any) => obj.id === categoryId);
    if (!category) {
      return null;
    }

    const categoryObj = category as any; // Type assertion to access Square-specific properties
    return {
      id: categoryObj.id || "",
      categoryData: {
        name: categoryObj.categoryData?.name || "Unnamed Category",
        abbreviation: categoryObj.categoryData?.abbreviation,
      },
      updatedAt: categoryObj.updatedAt,
      version: categoryObj.version,
      isDeleted: categoryObj.isDeleted || false,
      presentAtAllLocations: categoryObj.presentAtAllLocations || false,
      presentAtLocationIds: categoryObj.presentAtLocationIds || [],
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

/**
 * Search products with filters
 */
export async function searchProducts(
  filters: ProductSearchFilters = {}
): Promise<ProductSearchResult> {
  try {
    // First get available categories for smart assignment
    const availableCategories = await getCategories();
    // console.log(
    //   `📂 Available categories for assignment: ${availableCategories.length}`
    // );

    const searchRequest: any = {
      objectTypes: ["ITEM"],
      includeDeletedObjects: false,
      includeRelatedObjects: true,
      cursor: filters.cursor,
      limit: filters.limit || 500,
    };

    // console.log(`🔍 Search request:`, JSON.stringify(searchRequest, null, 2));

    // Build query based on filters
    // Only add text search query - we'll handle category filtering client-side after smart assignment
    if (filters.query && filters.query.trim()) {
      searchRequest.query = {
        prefixQuery: {
          attributeName: "name",
          attributePrefix: filters.query,
        },
      };
      // console.log(`🔍 Added text query: "${filters.query}"`);
    }

    const response = await squareClient.catalog.search(searchRequest);

    if (!response || !response.objects) {
      console.error("Failed to search products");
      return { products: [] };
    }

    const objects = response.objects || [];
    const relatedObjects = response.relatedObjects || [];

    // console.log(`📦 Square API returned ${objects.length} objects`);
    // console.log(
    //   `🔗 Square API returned ${relatedObjects.length} related objects`
    // );

    // Debug: Log types of related objects
    const relatedObjectTypes = relatedObjects.reduce((acc: any, obj: any) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1;
      return acc;
    }, {});
    // console.log(`Related object types:`, relatedObjectTypes);

    // Convert Square objects to our Product format
    const products = objects
      .filter((obj: any) => obj.type === "ITEM")
      .map((obj: any) =>
        convertSquareObjectToProduct(obj, relatedObjects, availableCategories)
      )
      .filter(
        (product: Product | null): product is Product => product !== null
      );

    // console.log(`✅ Converted ${products.length} products successfully`);

    // Apply category filtering if specified (now that we have smart assignments)
    let filteredProducts = products;
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      // console.log(
      //   `🏷️ Filtering products by categories: ${filters.categoryIds.join(", ")}`
      // );
      // console.log(
      //   `📦 Total products before category filtering: ${products.length}`
      // );

      // Debug: Log all product categories
      // products.forEach((product, index) => {
      //   console.log(
      //     `Product ${index + 1}: "${product.name}" - Category: ${
      //       product.category?.id || "No category"
      //     } (${product.category?.name || "N/A"})`
      //   );
      // });

      filteredProducts = products.filter((product: Product) => {
        const hasCategory =
          product.category &&
          filters.categoryIds!.includes(product.category.id);
        if (hasCategory) {
          // console.log(
          //   `✅ Product "${product.name}" matches category ${product.category?.id}`
          // );
        }
        return hasCategory;
      });

      // console.log(
      //   `📊 Products after category filtering: ${filteredProducts.length}`
      // );
    } else {
      // No category filter - show all products with their assigned categories
      filteredProducts = products;
    }

    // Apply price filtering if specified
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      // console.log(
      //   `💰 Applying price filters: ${filters.priceMin || "no min"} - ${
      //     filters.priceMax || "no max"
      //   }`
      // );
      filteredProducts = filteredProducts.filter((product: Product) => {
        const productPrice = product.price / 100; // Convert from cents to dollars
        if (filters.priceMin !== undefined && productPrice < filters.priceMin) {
          return false;
        }
        if (filters.priceMax !== undefined && productPrice > filters.priceMax) {
          return false;
        }
        return true;
      });
      // console.log(
      //   `💰 Products after price filtering: ${filteredProducts.length}`
      // );
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredProducts.sort((a: Product, b: Product) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "price":
            comparison = a.price - b.price;
            break;
          case "created_at":
            comparison =
              new Date(a.createdAt || 0).getTime() -
              new Date(b.createdAt || 0).getTime();
            break;
          case "updated_at":
            comparison =
              new Date(a.updatedAt || 0).getTime() -
              new Date(b.updatedAt || 0).getTime();
            break;
        }

        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return {
      products: filteredProducts,
      pagination: {
        cursor: response.cursor,
        hasMore: !!response.cursor,
      },
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [] };
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(
  limit: number = 8
): Promise<Product[]> {
  const result = await searchProducts({ limit });
  return result.products.slice(0, limit);
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // First, search for products to find the one with matching slug
    const searchResult = await searchProducts({ limit: 100 });

    const product = searchResult.products.find((p: Product) => p.slug === slug);

    if (!product) {
      return null;
    }

    // Get fresh data for the specific product
    return await getProductById(product.id);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/**
 * Get product by ID
 */
export async function getProductById(
  productId: string
): Promise<Product | null> {
  try {
    // Use search to find specific product by ID since direct retrieval method is unclear
    const response = await squareClient.catalog.search({
      objectTypes: ["ITEM"],
      includeDeletedObjects: false,
      includeRelatedObjects: true,
    });

    if (!response || !response.objects) {
      return null;
    }

    const product = response.objects.find((obj: any) => obj.id === productId);
    if (!product) {
      return null;
    }

    const relatedObjects = response.relatedObjects || [];
    const availableCategories = await getCategories();
    return convertSquareObjectToProduct(
      product,
      relatedObjects,
      availableCategories
    );
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}

/**
 * Get related products based on category
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const product = await getProductById(productId);
    if (!product || !product.category) {
      return [];
    }

    const searchResult = await searchProducts({
      categoryIds: [product.category.id],
      limit: limit + 1, // Get one extra to exclude the original product
    });

    // Filter out the original product and limit results
    return searchResult.products
      .filter((p: Product) => p.id !== productId)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

/**
 * Get inventory for products
 */
export async function getInventory(
  catalogObjectIds: string[]
): Promise<Record<string, number>> {
  try {
    // For now, return empty inventory until we figure out the correct method
    // TODO: Implement proper inventory retrieval when method is confirmed
    console.log("Inventory retrieval not yet implemented:", catalogObjectIds);
    return {};
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return {};
  }
}

/**
 * Helper function to convert Square catalog object to Product
 */
function convertSquareObjectToProduct(
  catalogObject: any,
  relatedObjects: any[] = [],
  availableCategories: SquareCategory[]
): Product | null {
  try {
    const item = catalogObject;
    const itemData = item.itemData;

    if (!itemData) {
      return null;
    }

    // console.log(`🔄 Converting product: "${itemData.name}"`);
    // console.log(`📋 Product categoryId: ${itemData.categoryId || "None"}`);
    // console.log(`🔗 Related objects count: ${relatedObjects.length}`);

    // Debug: Log all related objects
    // relatedObjects.forEach((obj, index) => {
    //   console.log(
    //     `Related Object ${index + 1}: Type=${obj.type}, ID=${obj.id}`
    //   );
    // });

    // Find category name from related objects
    let categoryName = "";
    let finalCategory: { id: string; name: string } | undefined;

    if (itemData.categoryId) {
      // console.log(`🔍 Looking for category with ID: ${itemData.categoryId}`);
      const category = relatedObjects.find(
        (obj: any) => obj.id === itemData.categoryId
      );

      if (category) {
        categoryName = category?.categoryData?.name || "";
        finalCategory = {
          id: itemData.categoryId,
          name: categoryName,
        };
        // console.log(`✅ Found category: ${categoryName}`);
      } else {
        // console.log(`❌ Category not found in related objects`);

        // Debug: Show what category IDs are available
        const categoryObjects = relatedObjects.filter(
          (obj) => obj.type === "CATEGORY"
        );
        console.log(
          `Available categories: ${categoryObjects
            .map((c) => `${c.id}:${c.categoryData?.name}`)
            .join(", ")}`
        );

        // Fallback: Use a placeholder name based on category ID
        categoryName = `Category ${itemData.categoryId.slice(-4)}`;
        finalCategory = {
          id: itemData.categoryId,
          name: categoryName,
        };
        // console.log(`🔧 Using fallback category name: ${categoryName}`);
      }
    } else {
      // Smart category assignment based on product name
      // console.log(
      //   `🤖 No category assigned, attempting smart assignment for: ${itemData.name}`
      // );
      finalCategory = assignCategoryToProduct(
        itemData.name,
        availableCategories
      );
      // if (finalCategory) {
      //   // console.log(
      //   //   `✨ Auto-assigned category: ${finalCategory.name} (${finalCategory.id})`
      //   // );
      // } else {
      //   // console.log(`❌ Could not auto-assign category`);
      // }
    }

    // Find images from related objects
    const productImages = [];
    if (itemData.imageIds && itemData.imageIds.length > 0) {
      for (const imageId of itemData.imageIds) {
        const imageObj = relatedObjects.find((obj: any) => obj.id === imageId);
        if (imageObj?.imageData?.url) {
          productImages.push({
            id: imageObj.id,
            url: imageObj.imageData.url,
            altText:
              imageObj.imageData.caption ||
              imageObj.imageData.name ||
              itemData.name,
            caption: imageObj.imageData.caption,
            width: 800, // Default width
            height: 600, // Default height
          });
        }
      }
    }

    // Add fallback image if no images are found
    if (productImages.length === 0) {
      productImages.push({
        id: `fallback-${item.id}`,
        url: "/images/product-placeholder.jpg",
        altText: itemData.name,
        caption: "Product Image",
        width: 800,
        height: 600,
      });
    }

    // Get main variation for pricing
    const mainVariation = itemData.variations?.[0];
    const price =
      mainVariation?.itemVariationData?.priceMoney?.amount || BigInt(0);
    const currency =
      mainVariation?.itemVariationData?.priceMoney?.currency || "USD";

    // Convert variations
    const variations = (itemData.variations || []).map((variation: any) => ({
      id: variation.id,
      name: variation.itemVariationData?.name,
      sku: variation.itemVariationData?.sku,
      price: Number(
        variation.itemVariationData?.priceMoney?.amount || BigInt(0)
      ),
      currency: variation.itemVariationData?.priceMoney?.currency || "USD",
      inStock: true, // Will be updated with inventory data
    }));

    return {
      id: item.id,
      name: itemData.name,
      description: itemData.descriptionPlaintext || itemData.description,
      descriptionHtml: itemData.descriptionHtml,
      slug: createSlug(itemData.name),
      price: Number(price),
      currency,
      images: productImages,
      category: finalCategory,
      variations,
      inStock: true, // Will be updated with inventory data
      availableOnline: itemData.availableOnline !== false,
      availableForPickup: itemData.availableForPickup !== false,
      sku: mainVariation?.itemVariationData?.sku,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  } catch (error) {
    console.error("Error converting Square object to Product:", error);
    return null;
  }
}

/**
 * Programmatically assign category to products based on product name
 * This is a temporary solution until categories are properly assigned in Square
 */
function assignCategoryToProduct(
  productName: string,
  availableCategories: SquareCategory[]
): { id: string; name: string } | undefined {
  const name = productName.toLowerCase();

  // Define category keywords
  const categoryMappings = [
    {
      keywords: ["iphone", "apple", "ios"],
      priority: 1,
      fallbackName: "iPhone Repair",
    },
    {
      keywords: ["samsung", "galaxy"],
      priority: 1,
      fallbackName: "Samsung Repair",
    },
    {
      keywords: ["google", "pixel"],
      priority: 1,
      fallbackName: "Google Pixel",
    },
    {
      keywords: ["case", "cover", "bumper", "protection"],
      priority: 2,
      fallbackName: "Cases & Covers",
    },
    {
      keywords: ["glass", "screen", "protector", "tempered"],
      priority: 2,
      fallbackName: "Screen Protection",
    },
    {
      keywords: ["charger", "cable", "adapter", "power"],
      priority: 2,
      fallbackName: "Charging Accessories",
    },
    {
      keywords: ["battery", "power bank"],
      priority: 2,
      fallbackName: "Batteries",
    },
    {
      keywords: ["tool", "kit", "repair"],
      priority: 2,
      fallbackName: "Repair Tools",
    },
  ];

  // Find the best matching category
  let bestMatch: { id: string; name: string } | undefined = undefined;
  let highestPriority = 0;
  let mostMatches = 0;

  for (const mapping of categoryMappings) {
    const matches = mapping.keywords.filter((keyword) =>
      name.includes(keyword)
    ).length;

    if (matches > 0) {
      // Higher priority or more keyword matches wins
      if (
        mapping.priority > highestPriority ||
        (mapping.priority === highestPriority && matches > mostMatches)
      ) {
        // Try to find a real category that matches
        const realCategory = availableCategories.find((cat) =>
          mapping.keywords.some((keyword) =>
            cat.categoryData.name.toLowerCase().includes(keyword)
          )
        );

        if (realCategory) {
          bestMatch = {
            id: realCategory.id,
            name: realCategory.categoryData.name,
          };
        } else {
          // Use the first available category as fallback
          bestMatch =
            availableCategories.length > 0
              ? {
                  id: availableCategories[0].id,
                  name: mapping.fallbackName,
                }
              : {
                  id: "auto-generated",
                  name: mapping.fallbackName,
                };
        }

        highestPriority = mapping.priority;
        mostMatches = matches;
      }
    }
  }

  return bestMatch;
}
