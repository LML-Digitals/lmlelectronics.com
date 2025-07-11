# LML Electronics API Documentation

This document outlines all API endpoints used in the LML Electronics frontend application.

## Base URL Configuration

The API base URL is configured through the environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## API Endpoints

### Categories API

#### 1. Get All Categories

```http
GET /api/inventory/categories
```

**Used in:**

- `src/components/Header.tsx` - Navigation menu
- `src/components/Footer.tsx` - Footer category links

**Response Type:** `InventoryItemCategory[]`

```typescript
interface InventoryItemCategory {
  id: string;
  name: string;
  description?: string;
  image: string;
  visible: boolean;
  parentId: string | null;
  children: InventoryItemCategory[];
  items: InventoryItem[];
}
```

#### 2. Get Category by Name

```http
GET /api/inventory/categories/{categoryName}
```

**Used in:** `src/app/products/category/[categoryName]/page.tsx`

**Parameters:**

- `categoryName`: URL-friendly category name (slug)

**Response Type:** `InventoryItemCategory`

#### 3. Get Category Breadcrumbs

```http
GET /api/inventory/categories/{categoryName}/breadcrumbs
```

**Used in:** `src/app/products/category/[categoryName]/page.tsx`

**Parameters:**

- `categoryName`: URL-friendly category name (slug)

**Response Type:** `CategoryBreadcrumb[]`

### Products API

#### 1. Get All Products

```http
GET /api/inventory/items
```

**Used in:**

- `src/components/products/ProductListing.tsx`
- Featured products section

**Optional Query Parameters:**

- `category`: Filter by category ID
- `limit`: Maximum number of items to return
- `search`: Search term to filter products

**Response Type:** `InventoryItem[]`

```typescript
interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  image: string;
  categories: InventoryItemCategory[];
  variations: InventoryItemVariation[];
}
```

#### 2. Get Product by ID

```http
GET /api/inventory/items/{productId}
```

**Used in:** `src/app/products/[productId]/page.tsx`

**Parameters:**

- `productId`: Unique product identifier

**Response Type:** `InventoryItem`

#### 3. Get Related Products

```http
GET /api/inventory/items?category={categoryId}&limit=5&exclude={productId}
```

**Used in:** `src/app/products/[productId]/page.tsx`

**Query Parameters:**

- `category`: Category ID to filter by
- `limit`: Maximum number of items (default: 5)
- `exclude`: Product ID to exclude from results

**Response Type:** `InventoryItem[]`

## Error Responses

All endpoints may return the following error responses:

### 404 Not Found

```json
{
  "error": "Resource not found",
  "message": "The requested resource does not exist"
}
```

### 400 Bad Request

```json
{
  "error": "Invalid request",
  "message": "Detailed error message"
}
```

### 500 Internal Server Error

```json
{
  "error": "Server error",
  "message": "An unexpected error occurred"
}
```

## Type Definitions

Full type definitions can be found in:

- `src/types/api.d.ts`
- `src/types/cartTypes.ts`

### Key Types

#### InventoryItemVariation

```typescript
interface InventoryItemVariation {
  id: string;
  sku: string;
  name: string;
  price: number;
  sellingPrice: number;
  visible: boolean;
  stock: number;
  shipping?: {
    weight: number;
    width: number;
    height: number;
    depth: number;
  };
  tax?: {
    taxable: boolean;
    rate?: number;
  };
}
```

## Implementation Examples

### Fetching Products

```typescript
// Example from ProductListing.tsx
const response = await fetch(buildApiUrl("/api/inventory/items"), {
  headers: {
    Accept: "application/json",
  },
});
const items = await handleApiResponse<InventoryItem[]>(response);
```

### Error Handling

```typescript
try {
  const response = await fetch(buildApiUrl("/api/inventory/categories"));
  const data = await handleApiResponse<InventoryItemCategory[]>(response);
} catch (error) {
  console.error("API Error:", error);
  // Use fallback data or show error UI
}
```

## Rate Limiting

- Standard rate limit: 100 requests per minute
- Burst rate limit: 20 requests per second
- Rate limits are per IP address

## Caching

The following endpoints are cached on the server:

- Category listings (5 minutes)
- Product details (1 minute)
- Category breadcrumbs (10 minutes)

Client-side caching should respect the `Cache-Control` headers returned by the API.
