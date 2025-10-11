"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = exports.ListItem = void 0;
var react_1 = require("react");
var ListItem = function (_a) {
    var className = _a.className, children = _a.children;
    return <li className={className}>{children}</li>;
};
exports.ListItem = ListItem;
var List = function (_a) {
    var items = _a.items, children = _a.children, _b = _a.as, Component = _b === void 0 ? 'ul' : _b, _c = _a.className, className = _c === void 0 ? 'text-gray-800 dark:text-gray-300 font-medium list-none' : _c, _d = _a.itemClassName, itemClassName = _d === void 0 ? '' : _d, _e = _a.itemSpacing, itemSpacing = _e === void 0 ? 'mb-4' : _e;
    // 1) Children mode
    if (children) {
        return <Component className={className}>{children}</Component>;
    }
    // 2) Data mode: items array
    if (items && items.length) {
        return (<Component className={className}>
        {items.map(function (item, idx) {
                var _a;
                return (<exports.ListItem key={(_a = item.key) !== null && _a !== void 0 ? _a : idx} className={[itemSpacing, itemClassName].filter(Boolean).join(' ')}>
            {item.text}
          </exports.ListItem>);
            })}
      </Component>);
    }
    // 3) No items
    return null;
};
exports.List = List;
exports.List.Item = exports.ListItem;
exports.default = exports.List;
