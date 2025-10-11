"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavList = void 0;
var react_1 = require("react");
/**
 * Renders a horizontal list of anchor links, optionally sticky.
 */
var NavList = function (_a) {
    var items = _a.items, LinkComponent = _a.LinkComponent, _b = _a.sticky, sticky = _b === void 0 ? false : _b;
    return (<nav className={"bg-white dark:bg-primary-900 z-10 py-2 shadow-xs".concat(sticky ? ' sticky top-0' : '')}>
      <ul className="container mx-auto flex space-x-6 overflow-x-auto px-4">
        {items.map(function (item) { return (<li key={item.href} className='whitespace-nowrap'>
            <LinkComponent href={item.href}>{item.title}</LinkComponent>
          </li>); })}
      </ul>
    </nav>);
};
exports.NavList = NavList;
exports.NavList.displayName = 'NavList';
