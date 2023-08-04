import DarkModeToggle from 'components/navigation/DarkModeToggle';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white shadow pt-4 dark:bg-gray-800">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-800 sm:text-center dark:text-gray-200">Eventuras</span>
        <DarkModeToggle />
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          <li>
            <Link href="/#privacy" className="mr-4 hover:underline md:mr-6 ">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/#accesibility" className="mr-4 hover:underline md:mr-6">
              Accesibility
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
