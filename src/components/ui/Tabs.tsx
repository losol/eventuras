import { Tab } from '@headlessui/react';
import React from 'react';

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
};

type TabsProps = {
  children: React.ReactElement<TabItemProps>[] | React.ReactElement<TabItemProps>;
};

const Tabs: React.FC<TabsProps> & { Item: React.FC<TabItemProps> } = ({ children }) => {
  const TabListClassName = 'flex space-x-10 p-3';
  const TabClassName = 'font-bold dark:text-primary-400';
  const TabPanelContainerClassname = 'p-3';
  const TabPanelClassname = '';
  const selectedTabClassName = 'text-primary-700 dark:text-primary-400';
  const notSelectedTabClassName = '';

  const isTabItemElement = (
    element: React.ReactNode
  ): element is React.ReactElement<TabItemProps> => {
    return React.isValidElement(element) && 'title' in element.props;
  };

  return (
    <Tab.Group>
      <Tab.List className={TabListClassName} as="ul">
        {React.Children.map(children, (child, index) =>
          isTabItemElement(child) ? (
            <Tab as="li" key={index}>
              {({ selected }) => (
                <button
                  className={`${TabClassName} ${
                    selected ? selectedTabClassName : notSelectedTabClassName
                  }`}
                >
                  {child.props.title}
                </button>
              )}
            </Tab>
          ) : null
        )}
      </Tab.List>
      <Tab.Panels className={TabPanelContainerClassname}>
        {React.Children.map(children, (child, index) =>
          isTabItemElement(child) ? (
            <Tab.Panel key={index} className={TabPanelClassname}>
              {child.props.children}
            </Tab.Panel>
          ) : null
        )}
      </Tab.Panels>
    </Tab.Group>
  );
};

const TabItem: React.FC<TabItemProps> = ({ children }) => {
  return <>{children}</>;
};

Tabs.Item = TabItem;

export default Tabs;
