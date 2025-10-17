import React from 'react';

const styles = {
  descriptionList: 'divide-y divide-gray-100 dark:divide-gray-800',
  item: 'px-2 py-2 grid grid-cols-2 md:grid-cols-4',
  term: 'text-sm font-medium leading-6 break-words md:col-span-1',
  definition: 'mt-1 text-sm leading-6 break-words md:col-span-3',
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
  testId?: string;
}

const Definition: React.FC<DefinitionProps> = (props) => {
  return (
    <dd className={styles.definition} data-testid={props.testId}>
      {props.children}
    </dd>
  );
};

export { Definition, DescriptionList, Item, Term };
