import { getCategories } from "@/lib/square/products";
import { SquareCategory } from "@/types/square";
import { HeaderClient } from "./HeaderClient";

const staticNavigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
];

export default async function Header() {
  let categories: SquareCategory[] = [];

  try {
    const categoriesData = await getCategories();
    categories = categoriesData.slice(0, 5); // Limit to 5 categories for header
  } catch (error) {
    console.error("Error loading categories:", error);
  }

  // Create navigation items combining static and dynamic categories
  const navigation = [
    ...staticNavigation,
    ...categories.map((category) => ({
      name: category.categoryData.name,
      href: `/products?category=${category.id}`,
    })),
  ];

  return <HeaderClient navigation={navigation} />;
}
