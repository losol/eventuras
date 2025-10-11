"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
var react_1 = require("react");
var Box_1 = require("../../layout/Box/Box");
var Container_1 = require("../../layout/Container/Container");
var Card = function (_a) {
    var _b = _a.dark, dark = _b === void 0 ? false : _b, _c = _a.container, container = _c === void 0 ? false : _c, children = _a.children, 
    // and these from BoxProps
    padding = _a.padding, margin = _a.margin, backgroundColorClass = _a.backgroundColorClass, backgroundImageUrl = _a.backgroundImageUrl, className = _a.className, style = _a.style, rest = __rest(_a, ["dark", "container", "children", "padding", "margin", "backgroundColorClass", "backgroundImageUrl", "className", "style"]);
    var baseClasses = "p-4 relative rounded-md transform transition duration-300 ease-in-out";
    var backgroundColorClasses = backgroundColorClass !== null && backgroundColorClass !== void 0 ? backgroundColorClass : 'bg-white dark:bg-slate-900 dark:bg-slate-900 hover:bg-primary-200 dark:hover:bg-primary-900';
    var textColorClasses = dark
        ? 'text-white'
        : 'text-slate-900 dark:text-gray-100';
    var cardClasses = [baseClasses, backgroundColorClasses, textColorClasses, className];
    var combinedStyle = (0, Box_1.getBackgroundStyle)(backgroundImageUrl) || style;
    return (<Box_1.Box as="div" padding={padding} margin={margin} backgroundColorClass={backgroundColorClass} backgroundImageUrl={backgroundImageUrl} className={cardClasses.join(' ')} style={combinedStyle} {...rest}>
      {container ? <Container_1.default>{children}</Container_1.default> : children}
    </Box_1.Box>);
};
exports.Card = Card;
