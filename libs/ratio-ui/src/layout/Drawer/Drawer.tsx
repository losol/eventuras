import { HTMLAttributes, ReactNode } from 'react';
import { X } from '../../icons';

import { Button  } from '../../core/Button';
import { Heading } from '../../core/Heading';
import { Portal } from '../../layout/Portal';
import React from 'react';

/**
 * DrawerProps interface for Drawer component
 * @property {boolean} isOpen - Determines if the Drawer is open
 * @property {() => void} onSave - Function to be called when the Drawer is saved
 * @property {() => void} onCancel - Function to be called when the Drawer is cancelled
 * @property {ReactNode} children - The children nodes of the Drawer component
 */
export interface DrawerProps {
  isOpen: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  children: ReactNode;
}

/**
 * DrawerChildProps interface for Drawer child components
 * @property {'Header' | 'Body' | 'Footer'} type - The type of the Drawer child component
 * @property {ReactNode} children - The children nodes of the Drawer child component
 * @property {string} className - The CSS class of the Drawer child component
 */
interface DrawerChildProps {
  type?: 'Header' | 'Body' | 'Footer';
  children: ReactNode;
  className?: string;
}

/**
 * HeaderProps interface for Header component
 * @property {'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'} as - The HTML tag for the Header component
 */
interface HeaderProps extends DrawerChildProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface BodyProps extends DrawerChildProps {}

interface FooterProps extends DrawerChildProps {}

interface DrawerComponent extends React.FC<DrawerProps> {
  Header: React.FC<HeaderProps>;
  Body: React.FC<BodyProps>;
  Footer: React.FC<FooterProps>;
}

const Drawer: DrawerComponent = (props: DrawerProps) => {
  const validChildren = React.Children.toArray(props.children);

  const filteredChildren = validChildren
    .map((child) => {
      if (React.isValidElement<HeaderProps | BodyProps | FooterProps>(child)) {
        return child;
      }
      return null; // Ignore other types of children
    })
    .filter(Boolean);

  const ariaHiddenProps: HTMLAttributes<HTMLDivElement> = props.isOpen
    ? {}
    : { 'aria-hidden': 'true' };

  const styles = {
    drawer: {
      base: 'flex flex-col p-6 fixed top-0 right-0 w-11/12 md:w-7/12 h-full bg-gray-100 dark:bg-slate-950 overflow-auto z-30',
      open: 'transition-opacity opacity-100 duration-2',
      closed: 'transition-all delay-500 opacity-0',
    },
  };

  return (
    <Portal isOpen={props.isOpen} clickOutside={props.onCancel}>
      <div
        id="backdrop"
        className="fixed top-0 left-0 bg-cover z-10 w-screen h-screen backdrop-blur-xs"
      />
      <section
        {...ariaHiddenProps}
        className={`${styles.drawer.base} ${props.isOpen ? styles.drawer.open : styles.drawer.closed}`}
      >
        {' '}
        {/* Cancel icon top right */}
        {props.onCancel && (
          <Button
            onClick={props.onCancel}
            className="absolute top-0 right-0 m-4"
            variant="secondary"
          >
            <X />
          </Button>
        )}
        {filteredChildren}
      </section>
    </Portal>
  );
};

// Header component
const Header: React.FC<HeaderProps> = (props) => {
  if (props.as) {
    return (
      <header>
        <Heading {...props}>{props.children}</Heading>
      </header>
    );
  } else {
    return <header {...props}>{props.children}</header>;
  }
};

// Body component
const Body: React.FC<BodyProps> = (props) => (
  <div role="main" className={`grow ${props.className || ''}`}>
    {props.children}
  </div>
);

// Footer component
const Footer: React.FC<FooterProps> = (props) => (
  <footer className={`pt-8 ${props.className}`}>{props.children}</footer>
);

// Define valid child types
Drawer.Header = Header;
Drawer.Body = Body;
Drawer.Footer = Footer;

export default Drawer;
