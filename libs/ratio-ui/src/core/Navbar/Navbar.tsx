import Link from 'next/link';


type NavbarProps = {
  title?: string;
  children?: React.ReactNode;
  bgDark?: boolean;
  bgColor?: string;
};

export const Navbar = (props: NavbarProps) => {
  const { bgDark = false, bgColor = 'bg-transparent' } = props;
  const textColor = bgDark ? 'text-white' : 'text-black dark:text-white';
  const fixedClassName = ' z-10';

  return (
    <nav className={`${bgColor} ${fixedClassName} dark:bg-slate-900 ${textColor} py-0`}>
      <div className="container flex flex-wrap items-center justify-between mx-auto py-2 px-3">
        <Link href="/">
          <span className={`text-2xl tracking-tight whitespace-nowrap ${textColor}`}>
            {props.title}
          </span>
        </Link>
        {props.children}
      </div>
    </nav>
  );
};

