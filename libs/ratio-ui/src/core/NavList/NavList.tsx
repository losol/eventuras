import React from 'react';

export interface NavListItem {
  href: string;
  title: string;
}

export interface NavListProps {
  items: NavListItem[];
  LinkComponent: React.JSXElementConstructor<{ href: string; children: React.ReactNode }>;
  sticky?: boolean;
}

/**
 * Renders a horizontal list of anchor links, optionally sticky.
 */
export const NavList: React.FC<NavListProps> = ({ items, LinkComponent, sticky = false }) => {
  return (
    <nav
      className={`bg-white dark:bg-primary-900 z-10 py-2 shadow-xs${
        sticky ? ' sticky top-0' : ''
      }`}
    >
      <ul className="container mx-auto flex space-x-6 overflow-x-auto px-4">
        {items.map(item => (
          <li key={item.href} className='whitespace-nowrap'>
            <LinkComponent href={item.href}>{item.title}</LinkComponent>
          </li>
        ))}
      </ul>
    </nav>
  );
};

NavList.displayName = 'NavList';
