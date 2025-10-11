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
exports.Section = void 0;
var react_1 = require("react");
var Box_1 = require("../Box/Box");
var Container_1 = require("../Container/Container");
var Section = function (_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? '' : _b, 
    // spacing props
    padding = _a.padding, margin = _a.margin, border = _a.border, width = _a.width, height = _a.height, 
    // background props
    backgroundColorClass = _a.backgroundColorClass, backgroundImageUrl = _a.backgroundImageUrl, 
    // section‑specific
    _c = _a.container, 
    // section‑specific
    container = _c === void 0 ? false : _c, rest = __rest(_a, ["children", "className", "padding", "margin", "border", "width", "height", "backgroundColorClass", "backgroundImageUrl", "container"]);
    var spacingClasses = (0, Box_1.buildSpacingClasses)({ padding: padding, margin: margin, border: border, width: width, height: height });
    var style = (0, Box_1.getBackgroundStyle)(backgroundImageUrl);
    var classes = [spacingClasses, backgroundColorClass, className]
        .filter(Boolean)
        .join(' ');
    return (<section className={classes} style={style} {...rest}>
      {container ? <Container_1.default>{children}</Container_1.default> : children}
    </section>);
};
exports.Section = Section;
exports.Section.displayName = 'Section';
exports.default = exports.Section;
