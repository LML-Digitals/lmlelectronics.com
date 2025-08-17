import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lmlelectronics.com';

function sanitizeSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];

  // Static routes
  const staticRoutes = [
    {
      path: '',
      priority: 1.0,
      changeFrequency: 'daily' as const,
    },
    {
      path: 'shop',
      priority: 0.9,
      changeFrequency: 'daily' as const,
    },
    {
      path: 'bundles',
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    },
    {
      path: 'blogs',
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    },
    {
      path: 'contact',
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    },
    {
      path: 'faqs',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
    {
      path: 'cart',
      priority: 0.3,
      changeFrequency: 'weekly' as const,
    },
    {
      path: 'checkout',
      priority: 0.3,
      changeFrequency: 'weekly' as const,
    },
    {
      path: 'orders',
      priority: 0.4,
      changeFrequency: 'weekly' as const,
    },
  ];
  
  for (const route of staticRoutes) {
    routes.push({
      url: `${baseUrl}/${route.path}`.replace(/\/$/, ''),
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  // Fetch categories
  try {
    const catRes = await fetch(`${baseUrl}/api/inventory/categories`);
    if (catRes.ok) {
      const categories = await catRes.json();
      for (const cat of categories) {
        if (cat.visible && !cat.parentId && cat.name !== 'Tickets') {
          routes.push({
            url: `${baseUrl}/shop/category/${sanitizeSlug(cat.name)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // Fetch products
  try {
    const prodRes = await fetch(`${baseUrl}/api/inventory/items`);
    if (prodRes.ok) {
      const products = await prodRes.json();
      for (const prod of products) {
        if (prod.variations && prod.variations.some((v: any) => v.visible)) {
          routes.push({
            url: `${baseUrl}/shop/${prod.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return routes;
} 