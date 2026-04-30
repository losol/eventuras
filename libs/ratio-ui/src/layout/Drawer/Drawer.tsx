import React, { ReactNode } from 'react';
import {
  Dialog as AriaDialog,
  Heading as AriaHeading,
  Modal,
  ModalOverlay,
} from 'react-aria-components';

import { Button } from '../../core/Button';
import { X } from '../../icons';
import { cn } from '../../utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  /** Whether clicking the backdrop closes the drawer. Defaults to true. */
  isDismissable?: boolean;
  /** When true, Escape no longer closes the drawer. Defaults to false. */
  isKeyboardDismissDisabled?: boolean;
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

interface HeadingSlotProps {
  children?: ReactNode;
  className?: string;
  /** Heading level (h1-h6). Defaults to 2. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface DrawerComponent extends React.FC<DrawerProps> {
  Header: React.FC<HeaderProps>;
  Heading: React.FC<HeadingSlotProps>;
  Body: React.FC<BodyProps>;
  Footer: React.FC<FooterProps>;
}

const Drawer: DrawerComponent = ({
  isOpen,
  onClose,
  children,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
}: DrawerProps) => {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      className="fixed inset-0 z-30 bg-cover backdrop-blur-xs"
    >
      <Modal className="fixed top-0 right-0 h-full w-11/12 md:w-10/12 lg:w-7/12 2xl:w-8/12 bg-gray-100 dark:bg-slate-950 overflow-auto">
        <AriaDialog className="relative flex flex-col p-6 outline-hidden h-full">
          {onClose && (
            <Button
              onClick={onClose}
              className="absolute top-0 right-0 m-4"
              variant="secondary"
              ariaLabel="Close drawer"
            >
              <X />
            </Button>
          )}
          {children}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
};

const headingClass = 'text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4';

const Header: React.FC<HeaderProps> = ({ as, children, className }) => {
  // When `as` is set, render the heading as a slotted RAC Heading so the
  // dialog gets its accessible name auto-wired via aria-labelledby.
  if (as) {
    const level = parseInt(as.charAt(1), 10) as 1 | 2 | 3 | 4 | 5 | 6;
    return (
      <header>
        <AriaHeading slot="title" level={level} className={cn(headingClass, className)}>
          {children}
        </AriaHeading>
      </header>
    );
  }
  return <header className={className}>{children}</header>;
};

const DrawerHeading: React.FC<HeadingSlotProps> = ({ children, className, level = 2 }) => (
  <AriaHeading slot="title" level={level} className={cn(headingClass, className)}>
    {children}
  </AriaHeading>
);

const Body: React.FC<BodyProps> = ({ children, className }) => (
  <div className={cn('grow', className)}>{children}</div>
);

const Footer: React.FC<FooterProps> = ({ children, className }) => (
  <footer className={cn('pt-8', className)}>{children}</footer>
);

Drawer.Header = Header;
Drawer.Heading = DrawerHeading;
Drawer.Body = Body;
Drawer.Footer = Footer;

export { Drawer };
