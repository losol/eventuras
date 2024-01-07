import React from 'react';

// Define styles
const styles = {
  descriptionList: 'divide-y divide-gray-100 dark:divide-gray-800',
  item: 'px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0',
  term: 'text-sm font-medium leading-6 break-words',
  definition: 'mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0 break-words',
};

// DescriptionList component
interface DescriptionListProps {
  children: React.ReactNode;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ children }) => {
  return <dl className={styles.descriptionList}>{children}</dl>;
};

// Item component
interface ItemProps {
  children: React.ReactNode;
}

const Item: React.FC<ItemProps> = ({ children }) => {
  return <div className={styles.item}>{children}</div>;
};

// Term component
interface TermProps {
  children: React.ReactNode;
}

const Term: React.FC<TermProps> = ({ children }) => {
  return <dt className={styles.term}>{children}</dt>;
};

// Definition component
interface DefinitionProps {
  children: React.ReactNode;
}

const Definition: React.FC<DefinitionProps> = ({ children }) => {
  return <dd className={styles.definition}>{children}</dd>;
};

export { Definition, DescriptionList, Item, Term };
