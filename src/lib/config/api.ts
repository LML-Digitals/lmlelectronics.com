// API configuration
export const API_BASE_URL
  = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

// Helper function to build API URLs
export function buildApiUrl (path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// Helper function to handle API responses
export async function handleApiResponse<T> (response: Response): Promise<T> {
  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json();

      throw new Error(errorData.message ?? `API Error: ${response.status}`);
    } catch (_e) {
      throw new Error(`API Error: ${response.status}`);
    }
  }

  // Check if response is HTML (indicating a wrong endpoint)
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('text/html')) {
    throw new Error('Invalid API response: Received HTML instead of JSON');
  }

  try {
    return await response.json();
  } catch (_e) {
    throw new Error('Failed to parse JSON response');
  }
}

// Default fallback data
export const fallbackData = {
  categories: [
    {
      id: 'phones',
      name: 'Phones',
      description: 'Mobile phone parts and accessories',
      image: '/images/category-placeholder.jpg',
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
      children: [],
      parentId: null,
      slug: 'phones',
      metadata: {},
    },
    {
      id: 'tablets',
      name: 'Tablets',
      description: 'Tablet parts and accessories',
      image: '/images/category-placeholder.jpg',
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
      children: [],
      parentId: null,
      slug: 'tablets',
      metadata: {},
    },
    {
      id: 'laptops',
      name: 'Laptops',
      description: 'Laptop parts and accessories',
      image: '/images/category-placeholder.jpg',
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
      children: [],
      parentId: null,
      slug: 'laptops',
      metadata: {},
    },
  ],
};
