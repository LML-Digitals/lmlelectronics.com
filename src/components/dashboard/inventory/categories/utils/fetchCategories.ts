import { CategoryWithChildren } from '@/components/dashboard/inventory/categories/CategoryTable';
import { getCategoryWithChildren } from '../services/itemCategoryCrud';

export async function fetchCategories(): Promise<{
  categories: CategoryWithChildren[];
  error: string | null;
}> {
  try {
    const data = await getCategoryWithChildren();

    const categories: CategoryWithChildren[] = data.map((category: any) => ({
      ...category,
      children: category.children.map((child: any) => ({
        ...child,
        children: child.children || [],
      })),
    }));

    return { categories, error: null };
  } catch (err) {
    return { categories: [], error: 'Check your internet connection.' };
  }
}
