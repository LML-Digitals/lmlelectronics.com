import Link from "next/link";
import { getCategories } from "@/lib/square/products";
import { SquareCategory } from "@/types/square";
import Image from "next/image";

// Get footer navigation with real categories
async function getFooterNavigation() {
  try {
    const categories = await getCategories();

    return {
      products: categories.slice(0, 5).map((category) => ({
        name: category.categoryData.name,
        href: `/products?category=${category.id}`,
      })),
      // support: [
      //   { name: "Contact Us", href: "/contact" },
      //   { name: "FAQ", href: "/faq" },
      //   { name: "Repair Guides", href: "/guides" },
      //   { name: "Warranty", href: "/warranty" },
      //   { name: "Returns", href: "/returns" },
      // ],
      // company: [
      //   { name: "About Us", href: "/about" },
      //   { name: "Careers", href: "/careers" },
      //   { name: "Press", href: "/press" },
      //   { name: "Blog", href: "/blog" },
      // ],
      // legal: [
      //   { name: "Privacy Policy", href: "/privacy" },
      //   { name: "Terms of Service", href: "/terms" },
      //   { name: "Cookie Policy", href: "/cookies" },
      // ],
    };
  } catch (error) {
    console.error("Error fetching footer categories:", error);
    // Fallback navigation
    return {
      products: [
        { name: "Repair Kits", href: "/products?category=repair-kits" },
        { name: "Components", href: "/products?category=components" },
        { name: "Apple Parts", href: "/products?brand=apple" },
        { name: "Samsung Parts", href: "/products?brand=samsung" },
        { name: "Google Parts", href: "/products?brand=google" },
      ],
      support: [
        { name: "Contact Us", href: "/contact" },
        { name: "FAQ", href: "/faq" },
        { name: "Repair Guides", href: "/guides" },
        { name: "Warranty", href: "/warranty" },
        { name: "Returns", href: "/returns" },
      ],
      company: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Blog", href: "/blog" },
      ],
      legal: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
      ],
    };
  }
}

const socialLinks = [
  {
    name: "Facebook",
    href: "#",
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.68.333 3.982.63c-.723.31-1.262.781-1.834 1.353C1.576 2.555 1.104 3.094.794 3.817.497 4.515.295 5.328.236 6.545.177 7.764.164 8.231.164 11.852c0 3.621.013 4.088.072 5.307.059 1.217.261 2.03.558 2.728.31.723.781 1.262 1.353 1.834.572.572 1.111 1.044 1.834 1.353.698.297 1.511.499 2.728.558 1.219.059 1.686.072 5.307.072 3.621 0 4.088-.013 5.307-.072 1.217-.059 2.03-.261 2.728-.558.723-.31 1.262-.781 1.834-1.353.572-.572 1.044-1.111 1.353-1.834.297-.698.499-1.511.558-2.728.059-1.219.072-1.686.072-5.307 0-3.621-.013-4.088-.072-5.307-.059-1.217-.261-2.03-.558-2.728-.31-.723-.781-1.262-1.353-1.834C20.444 1.576 19.905 1.104 19.182.794 18.484.497 17.671.295 16.454.236 15.235.177 14.768.164 11.147.164h.87zm-.066 1.985c.401-.007.815-.007 1.233-.007 3.565 0 3.986.012 5.394.07 1.301.059 2.006.274 2.476.456.622.242 1.067.532 1.534.999.467.467.757.912.999 1.534.182.47.397 1.175.456 2.476.058 1.408.07 1.829.07 5.394 0 3.565-.012 3.986-.07 5.394-.059 1.301-.274 2.006-.456 2.476-.242.622-.532 1.067-.999 1.534-.467.467-.912.757-1.534.999-.47.182-1.175.397-2.476.456-1.408.058-1.829.07-5.394.07-3.565 0-3.986-.012-5.394-.07-1.301-.059-2.006-.274-2.476-.456-.622-.242-1.067-.532-1.534-.999-.467-.467-.757-.912-.999-1.534-.182-.47-.397-1.175-.456-2.476-.058-1.408-.07-1.829-.07-5.394 0-3.565.012-3.986.07-5.394.059-1.301.274-2.006.456-2.476.242-.622.532-1.067.999-1.534.467-.467.912-.757 1.534-.999.47-.182 1.175-.397 2.476-.456 1.232-.057 1.703-.069 4.524-.07v.001zm8.633 2.305c-.884 0-1.6.716-1.6 1.6s.716 1.6 1.6 1.6 1.6-.716 1.6-1.6-.716-1.6-1.6-1.6zm-4.585 1.2c-3.729 0-6.75 3.021-6.75 6.75s3.021 6.75 6.75 6.75 6.75-3.021 6.75-6.75-3.021-6.75-6.75-6.75zm0 1.985c2.623 0 4.765 2.142 4.765 4.765s-2.142 4.765-4.765 4.765-4.765-2.142-4.765-4.765 2.142-4.765 4.765-4.765z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "#",
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default async function Footer() {
  const footerNavigation = await getFooterNavigation();

  return (
    <footer className="bg-gray-900 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      {/* Newsletter Signup */}
      <div className="bg-gray-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Get the latest repair guides, product updates, and exclusive deals
              delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                className="text-black px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 shadow-lg"
                style={{ backgroundColor: "#FDF200" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/images/lml_logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="w-10 h-10"
              />
              <div className="ml-2">
                <div className="text-lg font-bold text-white">Electronics</div>
                <div className="text-xs text-gray-400 -mt-1">Find Your Fix</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Your trusted partner for DIY electronic repair solutions. We
              provide high-quality repair kits, components, and tools to help
              you fix your devices and extend their lifespan.
            </p>

            {/* Contact Info */}
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Products
            </h3>
            <ul className="space-y-2">
              {footerNavigation.products.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-yellow-300 transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          {/* <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {footerNavigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-yellow-300 transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Company */}
          {/* <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-yellow-300 transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          <div className="space-y-2 text-gray-300">
            <div className="flex items-center">
              <span className="mr-2">📞</span>
              <span>1-800-LML-REPAIR</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📧</span>
              <span>support@lmlelectronics.com</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              <span>123 Electronics St, Tech City, TC 12345</span>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-yellow-300 transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* Certifications/Badges */}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <span className="mr-1">🔒</span>
                SSL Secured
              </span>
              <span className="flex items-center">
                <span className="mr-1">✅</span>
                Certified Repair Center
              </span>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        {/* <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-400">
              &copy; 2024 LML Electronics. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {footerNavigation.legal.map((item, index) => (
                <span key={item.name} className="flex items-center">
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-yellow-300 transition-colors"
                  >
                    {item.name}
                  </Link>
                  {index < footerNavigation.legal.length - 1 && (
                    <span className="ml-6 text-gray-600">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div> */}
      </div>
    </footer>
  );
}
