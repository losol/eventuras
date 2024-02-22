import { FooterLink } from '@/utils/site/getSiteSettings';

import Link from './Link';

interface Publisher {
  name: string;
  address: string;
  phone: string;
  email: string;
}
interface FooterProps {
  siteTitle?: string;
  links?: FooterLink[];
  publisher?: Publisher;
}

const Footer = (props: FooterProps) => {
  return (
    <>
      <footer className=" bg-white dark:bg-gray-900">
        <div className="container py-8">
          <div className="md:flex md:justify-between">
            {props.siteTitle && (
              <div className="mb-6 md:mb-0">
                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                  {props.siteTitle}
                </span>
                {props.publisher && (
                  <>
                    <div className="mt-2 font-light">
                      <p>{props.publisher.name}</p>
                      <p>{props.publisher.address}</p>
                      <p>{props.publisher.phone}</p>
                      <p>{props.publisher.email}</p>
                    </div>
                  </>
                )}
              </div>
            )}
            {props.links && (
              <div>
                <ul className="text-gray-800 dark:text-gray-300 font-medium list-none">
                  {props.links?.map((link, index) => (
                    <li key={index} className="mb-4">
                      <Link href={link.href}>{link.text}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
