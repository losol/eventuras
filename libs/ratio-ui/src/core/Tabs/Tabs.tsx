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
    'flex space-x-1 list-none overflow-x-auto border-b border-gray-200 dark:border-gray-700',
  tab: {
    base: 'font-medium py-2 px-5 cursor-pointer focus:outline-none transition-colors rounded-t-lg whitespace-nowrap',
    selected:
      'text-primary-600 dark:text-primary-400 bg-gray-50 dark:bg-gray-800 border-b-2 border-primary-600 dark:border-primary-400 font-semibold',
    notSelected:
      'text-gray-600 dark:text-gray-400 hover:text-gray-900 bg-gray-100 bg-opacity-80 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
  },
  panel: 'p-3 bg-white dark:bg-black',
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
