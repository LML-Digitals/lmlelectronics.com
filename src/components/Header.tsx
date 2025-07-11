import { HeaderClient } from "./HeaderClient";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Bundles", href: "/bundles" },
  // { name: "Categories", href: "/products/categories" },
];

export default function Header() {
  return <HeaderClient navigation={navigation} />;
}
