import { FooterLink } from '@/utils/site/getSiteSettings';

import Link from './Link';

interface FooterProps {
  text?: string;
  bgColor?: string;
  links?: FooterLink[];
}

const Footer = (props: FooterProps) => {
  const backgroundColor = props.bgColor || 'bg-gradient-to-r from-primary-700 to-cyan-950';
  return (
    <footer className={`${backgroundColor} shadow pt-4`}>
      <div className="container mx-auto p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm sm:text-center text-gray-200">{props.text ?? 'Eventuras'}</span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-200 dark:text-gray-400 sm:mt-0">
          {props.links?.map((link, index) => (
            <li key={index}>
              <Link href={link.href} className="text-gray-200">
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
