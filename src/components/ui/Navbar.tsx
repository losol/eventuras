import Link from 'next/link';

type NavbarProps = {
  title?: string;
  children?: React.ReactNode;
  dark?: boolean;
  bgColor?: string;
};

const Navbar = (props: NavbarProps) => {
  const { dark: lightText = false, bgColor = 'bg-transparent' } = props;
  const textColor = lightText ? 'text-white' : 'text-black';

  return (
    <nav className={`${bgColor} dark:bg-slate-900 ${textColor} py-3`}>
      <div className="container flex flex-wrap items-center justify-between mx-auto">
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

export default Navbar;
