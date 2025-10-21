import React, { ReactElement } from 'react';
import { Tab, TabList, TabPanel, Tabs as AriaTabs } from 'react-aria-components';
import { DATA_TEST_ID } from '@eventuras/utils';

// ✅ Export these so external files can reference them by name
export type TabItemProps = {
  id?: string;
  title: string;
  children: React.ReactNode | null;
  [DATA_TEST_ID]?: string;
};

export type TabsProps = {
  children: React.ReactNode;
};

export interface TabsComponent extends React.FC<TabsProps> {
  Item: React.FC<TabItemProps>;
}

const styles = {
  tabList: 'flex space-x-5 list-none overflow-x-auto border-b border-primary-500',
  tab: {
    base: 'font-bold py-2 px-1 cursor-pointer focus:outline-hidden',
    selected: 'text-primary-500 dark:text-primary-400 border-b-4 border-primary-800',
    notSelected: 'text-gray-500 dark:text-gray-400',
  },
  panel: 'py-4 px-2 bg-white',
};

export const Tabs: TabsComponent = ({ children }) => {
  const validChildren = React.Children.toArray(children).filter(React.isValidElement) as ReactElement<TabItemProps>[];

  return (
    <div>
      <AriaTabs>
        <TabList className={styles.tabList}>
          {validChildren.map(child => {
            const id = child.props.id ?? child.props.title;
            return (
              <Tab
                key={id}
                id={id}
                className={({ isSelected }) =>
                  `${styles.tab.base} ${isSelected ? styles.tab.selected : styles.tab.notSelected}`
                }
              >
                {child.props.title}
              </Tab>
            );
          })}
        </TabList>

        {validChildren.map(child => {
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
