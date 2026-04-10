import React from 'react';

const styles = {
  descriptionList: 'divide-y divide-gray-100 dark:divide-gray-800',
  item: 'px-2 py-2 grid grid-cols-2 md:grid-cols-4',
  term: 'text-sm font-medium leading-6 break-words md:col-span-1',
  definition: 'mt-1 text-sm leading-6 break-words md:col-span-3',
};

export interface DescriptionListProps {
  children: React.ReactNode;
}

export interface DescriptionListItemProps {
  children: React.ReactNode;
}

export interface DescriptionListTermProps {
  children: React.ReactNode;
}

export interface DescriptionListDefinitionProps {
  children: React.ReactNode;
  testId?: string;
}

export interface DescriptionProps {
  term: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}

const Root: React.FC<DescriptionListProps> = ({ children }) => (
  <dl className={styles.descriptionList}>{children}</dl>
);

const Item: React.FC<DescriptionListItemProps> = ({ children }) => (
  <div className={styles.item}>{children}</div>
);

const Term: React.FC<DescriptionListTermProps> = ({ children }) => (
  <dt className={styles.term}>{children}</dt>
);

const Definition: React.FC<DescriptionListDefinitionProps> = ({ children, testId }) => (
  <dd className={styles.definition} data-testid={testId}>
    {children}
  </dd>
);

/**
 * Shortcut combining Item, Term, and Definition. Use this when you have
 * a simple term/value pair. For complex layouts, compose Item/Term/Definition
 * directly.
 *
 * @example
 * <DescriptionList>
 *   <DescriptionList.Description term="Name">Ada Lovelace</DescriptionList.Description>
 *   <DescriptionList.Description term="Email">ada@example.com</DescriptionList.Description>
 * </DescriptionList>
 */
const Description: React.FC<DescriptionProps> = ({ term, children, testId }) => (
  <div className={styles.item}>
    <dt className={styles.term}>{term}</dt>
    <dd className={styles.definition} data-testid={testId}>
      {children}
    </dd>
  </div>
);

export const DescriptionList = Object.assign(Root, {
  Item,
  Term,
  Definition,
  Description,
});
