import React from 'react';
import { Tab, TabList, TabPanel, Tabs as AriaTabs } from 'react-aria-components';

/**
 * Props for individual tab items.
 * @typedef {Object} TabItemProps
 * @property {string} title - The title of the tab to be displayed in the tab list.
 * @property {React.ReactNode} children - The content to be displayed when this tab is active.
 */

/**
 * Props for the Tabs component, defining the structure for the entire tab group.
 * @typedef {Object} TabsProps
 * @property {(React.ReactElement<TabItemProps>[]|React.ReactElement<TabItemProps>)} children - Accepts a single tab item or an array of tab items.
 */

type TabItemProps = {
  title: string;
  children: React.ReactNode;
  dataTestId?: string;
};

type TabsProps = {
  children: React.ReactElement<TabItemProps>[] | React.ReactElement<TabItemProps>;
};

interface TabsComponent extends React.FC<TabsProps> {
  Item: React.FC<TabItemProps>;
}

const styles = {
  tabList: 'flex space-x-5 list-none overflow-x-auto border-b border-primary-500',
  tab: {
    base: 'font-bold py-2 px-1 cursor-pointer focus:outline-none',
    selected: 'text-primary-500 dark:text-primary-400 border-b-4 border-primary-800',
    notSelected: 'text-gray-500 dark:text-gray-400',
  },
  panel: '',
};

const Tabs: TabsComponent = ({ children }) => {
  return (
    <div>
      <AriaTabs>
        <TabList className={styles.tabList}>
          {React.Children.map(children, child => (
            <Tab
              id={child.props.title}
              className={({ isSelected }) =>
                `${styles.tab.base} ${isSelected ? styles.tab.selected : styles.tab.notSelected}`
              }
            >
              {child.props.title}
            </Tab>
          ))}
        </TabList>

        {/* Tab panels */}
        {React.Children.map(children, child => (
          <TabPanel id={child.props.title} className={styles.panel}>
            {child.props.children}
          </TabPanel>
        ))}
      </AriaTabs>
    </div>
  );
};

const TabItem: React.FC<TabItemProps> = ({ children }) => {
  return <>{children}</>;
};

Tabs.Item = TabItem;

export default Tabs;
