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
exports.Text = void 0;
var react_1 = require("react");
var utils_1 = require("@eventuras/utils");
var Box_1 = require("../../layout/Box/Box");
var Text = function (_a) {
    var _b;
    var text = _a.text, children = _a.children, _c = _a.as, Component = _c === void 0 ? 'div' : _c, _d = _a.className, className = _d === void 0 ? '' : _d, icon = _a.icon, padding = _a.padding, margin = _a.margin, border = _a.border, width = _a.width, height = _a.height, _e = utils_1.DATA_TEST_ID, testId = _a[_e], restHtmlProps = __rest(_a, ["text", "children", "as", "className", "icon", "padding", "margin", "border", "width", "height", typeof _e === "symbol" ? _e : _e + ""]);
    // 1) Only one of text/children
    if (text != null && children != null) {
        throw new Error("Text component cannot take both `text` and `children`. Please provide only one.");
    }
    // 2) Nothing to render?
    if (text == null && children == null) {
        return null;
    }
    var content = text != null ? text : children;
    // 3) Compute spacing
    var spacingCls = (0, Box_1.buildSpacingClasses)({ padding: padding, margin: margin, border: border, width: width, height: height });
    // 4) Final class list
    var classes = [spacingCls, className].filter(Boolean).join(' ');
    return (<Component className={classes} {...(testId ? (_b = {}, _b[utils_1.DATA_TEST_ID] = testId, _b) : {})} {...restHtmlProps}>
      {icon && <span className="mr-2 inline-flex items-center">{icon}</span>}
      {content}
    </Component>);
};
exports.Text = Text;
exports.default = exports.Text;
