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
exports.Link = void 0;
// core/Link.tsx
var react_1 = require("react");
var utils_1 = require("@eventuras/utils");
var Box_1 = require("../../layout/Box/Box");
var Button_1 = require("../Button/Button");
exports.Link = react_1.default.forwardRef(function (_a, ref) {
    var _b;
    var _c = _a.component, Component = _c === void 0 ? 'a' : _c, componentProps = _a.componentProps, href = _a.href, children = _a.children, _d = _a.className, className = _d === void 0 ? '' : _d, _e = _a.onDark, onDark = _e === void 0 ? false : _e, _f = _a.block, block = _f === void 0 ? false : _f, variant = _a.variant, _g = _a.linkOverlay, linkOverlay = _g === void 0 ? false : _g, padding = _a.padding, margin = _a.margin, border = _a.border, width = _a.width, height = _a.height, _h = utils_1.DATA_TEST_ID, testId = _a[_h], rest = __rest(_a, ["component", "componentProps", "href", "children", "className", "onDark", "block", "variant", "linkOverlay", "padding", "margin", "border", "width", "height", typeof _h === "symbol" ? _h : _h + ""]);
    var spacingClasses = (0, Box_1.buildSpacingClasses)({ padding: padding, margin: margin, border: border, width: width, height: height });
    var textColor = onDark || variant === 'button-primary'
        ? 'text-gray-200'
        : 'text-gray-800 dark:text-gray-200';
    var blockClass = block ? 'block' : '';
    var variantClasses = '';
    if (variant === null || variant === void 0 ? void 0 : variant.startsWith('button-')) {
        var key = variant.replace('button-', '');
        if (Button_1.buttonStyles[key])
            variantClasses = 'px-4 py-2 ' + Button_1.buttonStyles[key];
    }
    var classes = [
        spacingClasses,
        variantClasses,
        textColor,
        blockClass,
        linkOverlay && 'link-overlay',
        className,
    ]
        .filter(Boolean)
        .join(' ');
    return (<Component href={href} className={classes} ref={ref} {...(testId ? (_b = {}, _b[utils_1.DATA_TEST_ID] = testId, _b) : {})} {...componentProps} {...rest}>
        {children}
      </Component>);
});
exports.Link.displayName = 'Link';
exports.default = exports.Link;
