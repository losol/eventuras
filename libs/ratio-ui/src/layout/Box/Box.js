"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Box = void 0;
exports.buildSpacingClasses = buildSpacingClasses;
exports.getBackgroundStyle = getBackgroundStyle;
var react_1 = require("react");
/** Helper to build the spacing/size/border classes */
function buildSpacingClasses(_a) {
    var padding = _a.padding, margin = _a.margin, border = _a.border, width = _a.width, height = _a.height;
    return [
        padding,
        margin,
        border,
        width,
        height,
    ]
        .filter(Boolean)
        .join(' ');
}
/**
 * Build the inline style object for a background image,
 * merging in any existing `style` passed by the consumer.
 */
function getBackgroundStyle(backgroundImage, existingStyle, backgroundImageOverlay) {
    if (backgroundImageOverlay === void 0) { backgroundImageOverlay = true; }
    if (!backgroundImage)
        return existingStyle;
    var imageValue = backgroundImageOverlay
        ? "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url(".concat(backgroundImage, ")")
        : "url(".concat(backgroundImage, ")");
    return __assign({ backgroundImage: imageValue, backgroundSize: 'cover', backgroundPosition: 'center' }, existingStyle);
}
var Box = function (_a) {
    var _b = _a.as, Component = _b === void 0 ? 'div' : _b, padding = _a.padding, margin = _a.margin, border = _a.border, width = _a.width, height = _a.height, backgroundColorClass = _a.backgroundColorClass, backgroundImageUrl = _a.backgroundImageUrl, id = _a.id, _c = _a.className, className = _c === void 0 ? '' : _c, style = _a.style, children = _a.children, rest = __rest(_a, ["as", "padding", "margin", "border", "width", "height", "backgroundColorClass", "backgroundImageUrl", "id", "className", "style", "children"]);
    var spacingClasses = buildSpacingClasses({ padding: padding, margin: margin, border: border, width: width, height: height });
    var bgStyle = backgroundImageUrl
        ? __assign({ backgroundImage: "url(".concat(backgroundImageUrl, ")"), backgroundSize: 'cover', backgroundPosition: 'center' }, style) : style;
    var finalClassName = [
        spacingClasses,
        backgroundColorClass,
        className,
    ]
        .filter(Boolean)
        .join(' ');
    return (<Component id={id} className={finalClassName} style={bgStyle} {...rest}>
      {children}
    </Component>);
};
exports.Box = Box;
exports.Box.displayName = 'Box';
