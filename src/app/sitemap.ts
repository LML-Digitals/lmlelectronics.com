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
    '',
    'shop',
    'bundles',
    'cart',
    'checkout',
    'orders',
    'contact',
    'faqs',
  ];
  for (const path of staticRoutes) {
    routes.push({
      url: `${baseUrl}/${path}`.replace(/\/$/, ''),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
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