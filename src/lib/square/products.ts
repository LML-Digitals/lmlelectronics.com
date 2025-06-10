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
    // Use search to find specific category by ID with location filter
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
    // Build search request
    const searchRequest: any = {
      objectTypes: ["ITEM", "CATEGORY"],
      includeDeletedObjects: false,
      includeRelatedObjects: true,
      cursor: filters.cursor,
      limit: filters.limit || 500,
      categoryIds: filters.categoryIds || [],
    };

    // Add text search if specified (prioritize text search over category filtering)
    if (filters.query && filters.query.trim()) {
      searchRequest.query = {
        prefixQuery: {
          attributeName: "name",
          attributePrefix: filters.query,
        },
      };
    }
    // Note: Category filtering will be applied client-side since Square API
    // only allows one query type and we prioritize text search
    console.log("searchRequest", searchRequest);

    const response = await squareClient.catalog.search(searchRequest);

    if (!response || !response.objects) {
      console.error("Failed to search products");
      return { products: [] };
    }

    const objects = response.objects || [];
    const relatedObjects = response.relatedObjects || [];

    console.log(`🔍 Filtered from ${objects.length} Square objects`);

    // console.log("objects", objects);

    // Filter Square objects FIRST before conversion - more efficient
    const filteredObjects = objects
      .filter((obj: any) => obj.type === "ITEM")
      .filter((obj: any) => {
        // Filter based on Square's actual ecommerce availability properties
        const itemData = obj?.itemData || obj?.item_data;

        // Check if product is available for ecommerce and visible
        const ecomAvailable = itemData?.ecom_available === true;
        const ecomVisibility = itemData?.ecom_visibility;
        const isVisible =
          ecomVisibility !== "UNAVAILABLE" && ecomVisibility !== "UNINDEXED";
        const isNotArchived = !itemData?.isArchived;

        return ecomAvailable && isVisible && isNotArchived;
      })
      // // Apply category filter at the object level if API doesn't support it
      // .filter((obj: any) => {
      //   if (!filters.categoryIds || filters.categoryIds.length === 0) {
      //     return true; // No category filter
      //   }

      //   const itemData = obj?.itemData || obj?.item_data;
      //   return (
      //     itemData?.categoryId &&
      //     filters.categoryIds.includes(itemData.categoryId)
      //   );
      // });

    console.log(`✅ After filtering: ${filteredObjects.length} products`);

    // Convert filtered Square objects to our Product format
    const products = filteredObjects
      .map((obj: any) => convertSquareObjectToProduct(obj, relatedObjects))
      .filter(
        (product: Product | null): product is Product => product !== null
      );

    // Apply price filtering if specified
    let finalProducts = products;

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      finalProducts = products.filter((product: Product) => {
        const productPrice = product.price / 100; // Convert from cents to dollars
        if (filters.priceMin !== undefined && productPrice < filters.priceMin) {
          return false;
        }
        if (filters.priceMax !== undefined && productPrice > filters.priceMax) {
          return false;
        }
        return true;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      finalProducts.sort((a: Product, b: Product) => {
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
      products: finalProducts,
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
    const searchResult = await searchProducts({ limit: 500 });

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
    // Use search to find specific product by ID with location filter
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

    // Check ecommerce availability FIRST before conversion
    const productItem = product as any;
    const itemData = productItem?.itemData || productItem?.item_data;
    const ecomAvailable = itemData?.ecom_available === true;
    const ecomVisibility = itemData?.ecom_visibility;
    const isVisible =
      ecomVisibility !== "UNAVAILABLE" && ecomVisibility !== "UNINDEXED";
    const isNotArchived = !itemData?.isArchived;

    // Product should be ecom available, visible, and not archived
    if (!ecomAvailable || !isVisible || !isNotArchived) {
      return null;
    }

    const relatedObjects = response.relatedObjects || [];
    const convertedProduct = convertSquareObjectToProduct(
      product,
      relatedObjects
    );

    return convertedProduct;
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
    // console.log("Inventory retrieval not yet implemented:", catalogObjectIds);
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
  relatedObjects: any[] = []
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

    // Find category from related objects - use only Square's actual categories
    let finalCategory: { id: string; name: string } | undefined;

    if (itemData.categoryId) {
      const category = relatedObjects.find(
        (obj: any) => obj.id === itemData.categoryId && obj.type === "CATEGORY"
      );

      if (category && category.categoryData) {
        finalCategory = {
          id: itemData.categoryId,
          name: category.categoryData.name || "Unknown Category",
        };
      }
      // If category not found in related objects, we simply don't assign one
      // This means the product has a categoryId but the category data wasn't included
    }
    // If no categoryId, product has no category (undefined)

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
