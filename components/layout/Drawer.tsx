import { IconX } from '@tabler/icons-react';
import { Heading } from 'components/content';
import { Button } from 'components/inputs';
import { Portal } from 'components/layout';
import React, { HTMLAttributes, ReactNode } from 'react';

export interface DrawerProps {
  isOpen: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  children: ReactNode;
}
interface DrawerChildProps {
  type?: 'Header' | 'Body' | 'Footer';
  children: ReactNode;
  className?: string;
}

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
  let hasFooterChild = false;

  const filteredChildren = validChildren
    .map(child => {
      if (React.isValidElement<HeaderProps | BodyProps | FooterProps>(child)) {
        if (child.type === Drawer.Footer) {
          hasFooterChild = true;
        }
        return child;
      }
      return null; // Ignore other types of children
    })
    .filter(Boolean);

  // Append default Footer if none provided
  if (!hasFooterChild && (props.onSave || props.onCancel)) {
    filteredChildren.push(
      <Drawer.Footer key="default-footer">
        <div className="flex justify-between">
          {props.onSave && (
            <Button
              onClick={props.onSave}
              className="bg-transparent mr-5 px-10 py-2 w-100 flex-grow hover:bg-green-500 text-green-700 font-semibold hover:text-white border border-green-500 hover:border-transparent"
            >
              Submit
            </Button>
          )}
          {props.onCancel && (
            <Button
              onClick={props.onCancel}
              className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent"
            >
              Cancel
            </Button>
          )}
        </div>
      </Drawer.Footer>
    );
  }

  const ariaHiddenProps: HTMLAttributes<HTMLDivElement> = props.isOpen
    ? {}
    : { 'aria-hidden': 'true' };

  const baseClasses = [
    'flex',
    'flex-col',
    'p-6',
    'fixed',
    'top-0',
    'right-0',
    'w-4/5',
    'max-w-sm',
    'h-full',
    'bg-gray-100',
    'overflow-auto',
    'z-30',
  ];

  const conditionalClasses = props.isOpen
    ? ['transition-opacity', 'opacity-100', 'duration-2']
    : ['transition-all', 'delay-500', 'opacity-0'];

  const finalClasses = [...baseClasses, ...conditionalClasses].join(' ');

  return (
    <Portal isOpen={props.isOpen}>
      <div
        id="backdrop"
        className="fixed top-0 left-0 bg-cover z-10 w-screen h-screen backdrop-blur-sm"
      />
      <section id="test" {...ariaHiddenProps} className={finalClasses}>
        {props.onCancel && (
          <Button onClick={props.onCancel} className="absolute top-0 right-0 m-4">
            <IconX />
          </Button>
        )}
        {filteredChildren}
      </section>
    </Portal>
  );
};

// Header component
const Header: React.FC<HeaderProps> = props => {
  if (props.as) {
    return (
      <header className="">
        <Heading as={props.as}>{props.children}</Heading>
      </header>
    );
  } else {
    return <header>{props.children}</header>;
  }
};

// Body component
const Body: React.FC<BodyProps> = props => (
  <div role="main" className={`flex-grow ${props.className || ''}`}>
    {props.children}
  </div>
);

// Footer component
const Footer: React.FC<FooterProps> = props => (
  <footer className={`py-4 border-gray-300 ${props.className || ''}`}>{props.children}</footer>
);

// Define valid child types after the components are defined
Drawer.Header = Header;
Drawer.Body = Body;
Drawer.Footer = Footer;

export default Drawer;
