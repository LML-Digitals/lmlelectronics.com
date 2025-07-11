import Link from "next/link";
import Image from "next/image";

const navigation = {
  main: [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Bundles", href: "/products/bundles" },
    // { name: "Categories", href: "/products/categories" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

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
];

export default function Footer() {
  return (
    <footer className="bg-black text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Company Info */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center">
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
            </Link>
            <p className="text-gray-300 text-base">
              Your trusted partner for DIY electronic repair solutions. Quality
              repair kits and components to extend device lifespan.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-12 xl:mt-0 xl:col-span-2">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Quick Links
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.main.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-base text-gray-300 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Contact
                </h3>
                <ul className="mt-4 space-y-4">
                  <li className="text-base text-gray-300">
                    <span className="block">1-800-LML-REPAIR</span>
                    <span className="block break-words text-sm sm:text-base">
                      support@lmlelectronics.com
                    </span>
                  </li>
                  <li className="text-base text-gray-300">
                    123 Electronics St,
                    <br />
                    Tech City, TC 12345
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} LML Electronics. All rights
            reserved.
            {/* {navigation.legal.map((item, index) => (
              <span key={item.name}>
                <span className="mx-2">·</span>
                <Link
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              </span>
            ))} */}
          </p>
        </div>
      </div>
    </footer>
  );
}
