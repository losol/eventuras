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
exports.buttonStyles = exports.defaultButtonPadding = void 0;
var react_1 = require("react");
var icons_1 = require("../icons");
var Box_1 = require("../../layout/Box/Box");
exports.defaultButtonPadding = 'px-4 py-1';
// Animation constants
var ANIMATION_CLASSES = [
    'transition-all',
    'duration-500',
    'transform',
    'ease-in-out',
    'active:scale-110',
    'hover:shadow-sm',
].join(' ');
exports.buttonStyles = {
    primary: "border font-bold bg-primary-700 dark:bg-primary-950 hover:bg-primary-700 text-white rounded-full ".concat(ANIMATION_CLASSES),
    secondary: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:border-gray-400 " +
        "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 " +
        "rounded-full ".concat(ANIMATION_CLASSES),
    light: "bg-primary-100 text-gray-800 hover:bg-primary-200 dark:bg-primary-800 dark:text-white " +
        "dark:hover:bg-primary-700 rounded-full ".concat(ANIMATION_CLASSES),
    text: "bg-transparent hover:bg-primary-200 hover:bg-opacity-20 rounded-full ".concat(ANIMATION_CLASSES),
    outline: "border border-gray-700 hover:border-primary-500 hover:bg-primary-100/10 dark:hover:bg-primary-900 " +
        "dark:text-white rounded-full ".concat(ANIMATION_CLASSES),
};
var Button = (0, react_1.forwardRef)(function Button(_a, ref) {
    var _b = _a.variant, variant = _b === void 0 ? 'primary' : _b, _c = _a.onDark, onDark = _c === void 0 ? false : _c, _d = _a.block, block = _d === void 0 ? false : _d, _e = _a.disabled, disabled = _e === void 0 ? false : _e, _f = _a.loading, loading = _f === void 0 ? false : _f, icon = _a.icon, children = _a.children, ariaLabel = _a.ariaLabel, _g = _a.className, className = _g === void 0 ? '' : _g, _h = _a.type, type = _h === void 0 ? 'button' : _h, onClick = _a.onClick, 
    // spacing props:
    _j = _a.padding, 
    // spacing props:
    padding = _j === void 0 ? exports.defaultButtonPadding : _j, _k = _a.margin, margin = _k === void 0 ? 'm-1' : _k, border = _a.border, width = _a.width, height = _a.height, dataTestId = _a["data-test-id"], 
    // all other native button props (e.g. id, name, value)
    rest = __rest(_a, ["variant", "onDark", "block", "disabled", "loading", "icon", "children", "ariaLabel", "className", "type", "onClick", "padding", "margin", "border", "width", "height", 'data-test-id']);
    var spacingClasses = (0, Box_1.buildSpacingClasses)({ padding: padding, margin: margin, border: border, width: width, height: height });
    var displayClass = block ? 'w-full' : '';
    var variantClass = exports.buttonStyles[variant];
    var isTransparent = variant === 'text' || variant === 'outline';
    var textColorClass = '';
    if (isTransparent) {
        textColorClass = onDark
            ? 'text-white'
            : 'text-black dark:text-white';
    }
    var disabledClasses = (disabled || loading) ? 'opacity-75 cursor-not-allowed' : '';
    // 3) combine everything
    var classes = [
        spacingClasses,
        displayClass,
        variantClass,
        textColorClass,
        disabledClasses,
        className,
    ].filter(Boolean).join(' ');
    return (<button ref={ref} type={type} disabled={disabled || loading} aria-label={ariaLabel} onClick={onClick} className={classes} data-test-id={dataTestId} {...rest}>
      {loading && (<icons_1.LoaderCircle className="h-4 w-4 animate-spin mr-2 flex-shrink-0" aria-hidden="true"/>)}
      {!loading && icon && (<span className="mr-2 flex-shrink-0">{icon}</span>)}
      {children}
    </button>);
});
Button.displayName = 'Button';
exports.default = Button;
