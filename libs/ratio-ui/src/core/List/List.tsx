import React from 'react';

export interface ListItemProps {
  className?: string;
  children?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({
  className,
  children,
}) => {
  return <li className={className}>{children}</li>;
};

export type ListVariant = 'unstyled' | 'markdown' | 'markdown-compact';

export interface ListProps {
  items?: { key?: React.Key; text: React.ReactNode }[];
  children?: React.ReactNode;
  as?: 'ul' | 'ol';
  variant?: ListVariant;
  className?: string;
  itemClassName?: string;
  itemSpacing?: string;
}

const variantStyles: Record<ListVariant, { list: string; item: string }> = {
  unstyled: {
    list: 'list-none',
    item: 'mb-4',
  },
  markdown: {
    list: 'ml-6 pb-4 space-y-2 marker:text-blue-600',
    item: 'pl-2 leading-relaxed',
  },
  'markdown-compact': {
    list: 'ml-6 pb-3 space-y-1.5 marker:text-blue-600',
    item: 'pl-2',
  },
};

export const List: React.FC<ListProps> & { Item: typeof ListItem } = ({
  items,
  children,
  as: Component = 'ul',
  variant = 'unstyled',
  className,
  itemClassName,
  itemSpacing,
}) => {
  const variantStyle = variantStyles[variant];

  // Determine list-specific marker styles
  const markerStyles = Component === 'ol' && variant !== 'unstyled'
    ? 'marker:font-semibold'
    : '';

  // Determine list type styles
  const listTypeStyles = variant !== 'unstyled'
    ? Component === 'ul'
      ? 'list-disc'
      : 'list-decimal'
    : '';

  // Build final classNames
  const finalListClassName = [
    variant === 'unstyled' ? 'text-gray-800 dark:text-gray-300 font-medium' : '',
    listTypeStyles,
    variantStyle.list,
    markerStyles,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const finalItemClassName = [
    itemSpacing || variantStyle.item,
    itemClassName,
  ]
    .filter(Boolean)
    .join(' ');

  // 1) Children mode
  if (children) {
    return <Component className={finalListClassName}>{children}</Component>;
  }

  // 2) Data mode: items array
  if (items && items.length) {
    return (
      <Component className={finalListClassName}>
        {items.map((item, idx) => (
          <ListItem
            key={item.key ?? idx}
            className={finalItemClassName}
          >
            {item.text}
          </ListItem>
        ))}
      </Component>
    );
  }

  // 3) No items
  return null;
};

List.Item = ListItem;

export default List;
