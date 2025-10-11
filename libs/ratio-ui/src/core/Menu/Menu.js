"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@eventuras/utils");
var react_aria_components_1 = require("react-aria-components");
var icons_1 = require("../icons");
var styles = {
    menuWrapper: 'top-16 w-56 text-right',
    menu: 'relative inline-block text-left',
    menuTrigger: 'inline-flex justify-center w-full px-4 py-2 text-sm',
    menuItemsList: 'w-56 origin-top-right divide-y divide-gray-400 bg-white dark:bg-slate-900 shadow-lg ring-1 ring-black/5 focus:outline-hidden',
    menuItem: 'cursor-pointer group flex w-full items-center px-2 py-3 hover:bg-primary-100 dark:hover:bg-primary-900 text-gray-900 dark:text-gray-100',
};
var ChevronIcon = function () { return (<icons_1.ChevronDown className="ml-2 h-5 w-5" aria-hidden="true"/>); };
var MenuLink = function (props) {
    var _a;
    return (<react_aria_components_1.MenuItem {...props} {..._a = {}, _a[utils_1.DATA_TEST_ID] = props[utils_1.DATA_TEST_ID], _a} className={styles.menuItem}>
      {props.children}
    </react_aria_components_1.MenuItem>);
};
/**
 * React-Aria menu does not provide support of interactive elements within the MenuItem, we therefore
 * create this functionMap which is then called by the Menu's onAction
 */
var functionMap = new Map();
var MenuButton = function (props) {
    var _a;
    functionMap.set(props.id, props.onClick);
    return (<react_aria_components_1.MenuItem {...props} className={styles.menuItem} {..._a = {}, _a[utils_1.DATA_TEST_ID] = props[utils_1.DATA_TEST_ID], _a}>
      {props.children}
    </react_aria_components_1.MenuItem>);
};
var Menu = function (props) {
    var _a;
    return (<react_aria_components_1.MenuTrigger>
      <react_aria_components_1.Button {..._a = {}, _a[utils_1.DATA_TEST_ID] = 'logged-in-menu-button', _a}>
        <div className={styles.menuTrigger}>
          {props.menuLabel}
          <ChevronIcon />
        </div>
      </react_aria_components_1.Button>
      <react_aria_components_1.Popover>
        <react_aria_components_1.Menu className={styles.menuItemsList} onAction={function (key) {
            var func = functionMap.get(key.toString());
            if (func)
                func();
        }}>
          {props.children}
        </react_aria_components_1.Menu>
      </react_aria_components_1.Popover>
    </react_aria_components_1.MenuTrigger>);
};
Menu.Link = MenuLink;
Menu.Button = MenuButton;
exports.default = Menu;
