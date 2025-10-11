"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tabs = void 0;
var react_1 = require("react");
var react_aria_components_1 = require("react-aria-components");
var utils_1 = require("@eventuras/utils");
var styles = {
    tabList: 'flex space-x-5 list-none overflow-x-auto border-b border-primary-500',
    tab: {
        base: 'font-bold py-2 px-1 cursor-pointer focus:outline-hidden',
        selected: 'text-primary-500 dark:text-primary-400 border-b-4 border-primary-800',
        notSelected: 'text-gray-500 dark:text-gray-400',
    },
    panel: 'py-4 px-2 bg-white',
};
var Tabs = function (_a) {
    var children = _a.children;
    var validChildren = react_1.default.Children.toArray(children).filter(react_1.default.isValidElement);
    return (<div>
      <react_aria_components_1.Tabs>
        <react_aria_components_1.TabList className={styles.tabList}>
          {validChildren.map(function (child) {
            var _a;
            var id = (_a = child.props.id) !== null && _a !== void 0 ? _a : child.props.title;
            return (<react_aria_components_1.Tab key={id} id={id} className={function (_a) {
                    var isSelected = _a.isSelected;
                    return "".concat(styles.tab.base, " ").concat(isSelected ? styles.tab.selected : styles.tab.notSelected);
                }}>
                {child.props.title}
              </react_aria_components_1.Tab>);
        })}
        </react_aria_components_1.TabList>

        {validChildren.map(function (child) {
            var _a;
            var id = (_a = child.props.id) !== null && _a !== void 0 ? _a : child.props.title;
            return (<react_aria_components_1.TabPanel key={id} id={id} className={styles.panel}>
              {child.props.children}
            </react_aria_components_1.TabPanel>);
        })}
      </react_aria_components_1.Tabs>
    </div>);
};
exports.Tabs = Tabs;
var TabItem = function (_a) {
    var children = _a.children;
    return <>{children}</>;
};
exports.Tabs.Item = TabItem;
