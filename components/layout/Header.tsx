import Link from 'next/link';

import UserMenu from './UserMenu';

type HeaderProps = {
  title?: string;
};

const Header = (props: HeaderProps) => {
  return (
    <nav className="bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center">
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            {props.title}
          </span>
        </Link>
        <UserMenu />
      </div>
    </nav>
  );
};

export default Header;
