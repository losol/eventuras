import { ObfuscatedEmail } from '../ObfuscatedEmail';

export interface Publisher {
  name: string;
  address: string;
  phone: string;
  email: string;
  organizationNumber?: string;
}

interface FooterProps {
  siteTitle?: string;
  publisher?: Publisher;
  children?: React.ReactNode;
}

export const Footer = (props: FooterProps) => {
  return (
      <footer className="p-3 pt-10 bg-white dark:bg-gray-900">
        <div className="container p-3 mx-auto">
          <div className="md:flex md:justify-between">
            {props.siteTitle && (
              <div className="mb-6 md:mb-0">
                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                  {props.siteTitle}
                </span>
                {props.publisher && (
                    <div className="mt-2 font-light">
                      <p>{props.publisher.name}</p>
                      <p>{props.publisher.address}</p>
                      <p>{props.publisher.phone}</p>
                      {props.publisher.email && (
                        <ObfuscatedEmail
                          email={props.publisher.email}
                          className="block"
                        />
                      )}
                      {props.publisher.organizationNumber && (
                        <p>Org.nr. {props.publisher.organizationNumber}</p>
                      )}
                    </div>
                )}
              </div>
            )}
            {props.children && (
              <div>
                {props.children}
              </div>
            )}
          </div>
        </div>
      </footer>
  );
};
