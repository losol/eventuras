import React from 'react';

export interface ListItemProps {
  className?: string;
  children: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({
  className,
  children,
}) => {
  return <li className={className}>{children}</li>;
};

export interface ListProps {
  items?: { key?: React.Key; text: React.ReactNode }[];
  children?: React.ReactNode;
  as?: 'ul' | 'ol';
  className?: string;
  itemClassName?: string;
  itemSpacing?: string;
}

export const List: React.FC<ListProps> & { Item: typeof ListItem } = ({
  items,
  children,
  as: Component = 'ul',
  className = 'text-gray-800 dark:text-gray-300 font-medium list-none',
  itemClassName = '',
  itemSpacing = 'mb-4',
}) => {
  // 1) Children mode
  if (children) {
    return <Component className={className}>{children}</Component>;
  }

  // 2) Data mode: items array
  if (items && items.length) {
    return (
      <Component className={className}>
        {items.map((item, idx) => (
          <ListItem
            key={item.key ?? idx}
            className={[itemSpacing, itemClassName].filter(Boolean).join(' ')}
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
