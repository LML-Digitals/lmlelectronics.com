import { HeaderClient } from "./HeaderClient";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Bundles", href: "/bundles" },
  { name: "Cart", href: "/cart" },
  { name: "Orders", href: "/orders" },
];

export default function Header() {
  return <HeaderClient navigation={navigation} />;
}
