import React, { ReactElement } from 'react';
import { Tab, TabList, TabPanel, Tabs as AriaTabs } from 'react-aria-components';

// ✅ Export these so external files can reference them by name
export type TabItemProps = {
  id?: string;
  title: string;
  children: React.ReactNode | null;
  testId?: string;
};

export type TabsProps = {
  children: React.ReactNode;
  defaultSelectedKey?: string;
  selectedKey?: string;
  onSelectionChange?: (key: string) => void;
  className?: string;
};

export interface TabsComponent extends React.FC<TabsProps> {
  Item: React.FC<TabItemProps>;
}

const styles = {
  tabList:
    'flex space-x-1 list-none overflow-x-auto border-b-2 border-gray-300 dark:border-gray-600',
  tab: {
    base: 'font-medium py-2 px-5 cursor-pointer focus:outline-none transition-colors rounded-t-lg whitespace-nowrap',
    selected:
      'text-primary-900 dark:text-primary-200 bg-primary-200 dark:bg-primary-800 border-b-2 border-primary-500 dark:border-primary-400 font-semibold',
    notSelected:
      'text-gray-900 dark:text-gray-200 bg-primary-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700',
  },
  panel: 'p-3 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900',
};

export const Tabs: TabsComponent = ({
  children,
  defaultSelectedKey,
  selectedKey,
  onSelectionChange,
  className,
}) => {
  const validChildren = React.Children.toArray(children).filter(
    React.isValidElement
  ) as ReactElement<TabItemProps>[];

  return (
    <div className={className}>
      <AriaTabs
        defaultSelectedKey={defaultSelectedKey}
        selectedKey={selectedKey}
        onSelectionChange={(key) => onSelectionChange?.(key as string)}
      >
        <TabList className={styles.tabList}>
          {validChildren.map((child) => {
            const id = child.props.id ?? child.props.title;
            return (
              <Tab
                key={id}
                id={id}
                data-testid={child.props.testId}
                className={({ isSelected }) =>
                  `${styles.tab.base} ${isSelected ? styles.tab.selected : styles.tab.notSelected}`
                }
              >
                {child.props.title}
              </Tab>
            );
          })}
        </TabList>

        {validChildren.map((child) => {
          const id = child.props.id ?? child.props.title;
          return (
            <TabPanel key={id} id={id} className={styles.panel}>
              {child.props.children}
            </TabPanel>
          );
        })}
      </AriaTabs>
    </div>
  );
};

const TabItem: React.FC<TabItemProps> = ({ children }) => <>{children}</>;
Tabs.Item = TabItem;
