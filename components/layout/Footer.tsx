import Link from 'next/link';

import ThemeToggle from '@/components/ThemeToggle';
import { siteConfig } from '@/config/site';

const Footer = () => {
  return (
    <footer className="bg-white pt-4 shadow dark:bg-gray-800">
      <div className="mx-auto w-full max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-800 dark:text-gray-200 sm:text-center">
          {siteConfig.name}
        </span>
        <ThemeToggle />
        <ul className="mt-3 flex flex-wrap items-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          <li>
            <Link
              href={siteConfig.footer.links.privacy.href}
              className="mr-4 hover:underline md:mr-6 "
            >
              {siteConfig.footer.links.privacy.title}
            </Link>
          </li>
          <li>
            <Link
              href={siteConfig.footer.links.accesibility.href}
              className="mr-4 hover:underline md:mr-6"
            >
              {siteConfig.footer.links.accesibility.title}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
