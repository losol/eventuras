import { Container } from '../../layout/Container';
import { cn } from '../../utils/cn';
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
  /**
   * Marks the footer as a dark surface so child text uses the light
   * `var(--text)` color. Use when the footer is rendered against a
   * dark page or branded section.
   */
  dark?: boolean;
}

export const Footer = (props: FooterProps) => {
  return (
    <footer className={cn('p-3 pt-10 bg-black/10 dark:bg-white/10', props.dark && 'surface-dark')}>
      <Container>
        <div className="md:flex md:justify-between">
          {props.siteTitle && (
            <div className="mb-6 md:mb-0">
              <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                {props.siteTitle}
              </span>
              {props.publisher && (
                <div className="mt-2 font-light leading-tight">
                  <p>{props.publisher.name}</p>
                  <p>{props.publisher.address}</p>
                  <p>{props.publisher.phone}</p>
                  {props.publisher.email && (
                    <ObfuscatedEmail email={props.publisher.email} className="block" />
                  )}
                  {props.publisher.organizationNumber && (
                    <p>Org.nr. {props.publisher.organizationNumber}</p>
                  )}
                </div>
              )}
            </div>
          )}
          {props.children && <div>{props.children}</div>}
        </div>
      </Container>
    </footer>
  );
};
