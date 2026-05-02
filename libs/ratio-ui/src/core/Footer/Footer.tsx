import React from 'react';

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

export interface FooterProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Render the footer as a dark surface — flips the background to
   * `--color-primary-900` (Linseed deep) and applies `surface-dark`
   * so child text picks up the light `var(--text)` color. In dark
   * mode the footer also gets a thin `--color-primary-700` top border
   * so it reads as a separate block against the dark page surface.
   * Use to anchor the bottom of the page with a deep block.
   */
  dark?: boolean;
}

export interface FooterClassicProps extends FooterProps {
  siteTitle?: string;
  publisher?: Publisher;
}

interface FooterComponent extends React.FC<FooterProps> {
  Classic: React.FC<FooterClassicProps>;
}

/**
 * Thin `<footer>` shell with the standard background, padding, and
 * `Container` wrapper. Compose your own layout inside — see
 * `Footer.Classic` for the legacy fixed layout (siteTitle + publisher
 * block on the left, children on the right). Subcomponents
 * (`Footer.Brand`, `Footer.Content`, …) are planned for a future minor
 * release; for now use plain markup.
 */
const FooterRoot: FooterComponent = (({ children, className, dark }: FooterProps) => (
  <footer
    className={cn(
      'p-3 pt-10',
      dark
        ? 'bg-primary-900 surface-dark dark:border-t dark:border-primary-700'
        : 'bg-overlay-press',
      className,
    )}
  >
    <Container>{children}</Container>
  </footer>
)) as FooterComponent;

/**
 * Pre-2.0 Footer layout — siteTitle and an optional publisher block on
 * the left, children stacked next to it via `md:flex md:justify-between`.
 *
 * Renders the `Footer` shell underneath so wrapper styles (background,
 * padding, surface tone, Container) live in exactly one place.
 *
 * Kept as a backward-compat wrapper for the four `apps/web` layouts and
 * `apps/historia` that already shipped with this exact shape. New code
 * should use the `<Footer>` shell directly and lay out its own content.
 */
const FooterClassic: React.FC<FooterClassicProps> = ({
  siteTitle,
  publisher,
  children,
  className,
  dark,
}) => (
  <FooterRoot className={className} dark={dark}>
    <div className="md:flex md:justify-between">
      {siteTitle && (
        <div className="mb-6 md:mb-0">
          <span className="self-center text-xl font-semibold whitespace-nowrap">
            {siteTitle}
          </span>
          {publisher && (
            <div className="mt-2 font-light leading-tight">
              <p>{publisher.name}</p>
              <p>{publisher.address}</p>
              <p>{publisher.phone}</p>
              {publisher.email && (
                <ObfuscatedEmail email={publisher.email} className="block" />
              )}
              {publisher.organizationNumber && (
                <p>Org.nr. {publisher.organizationNumber}</p>
              )}
            </div>
          )}
        </div>
      )}
      {children && <div>{children}</div>}
    </div>
  </FooterRoot>
);

FooterRoot.Classic = FooterClassic;

export const Footer = FooterRoot;
