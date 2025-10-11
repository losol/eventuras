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
var react_1 = require("react");
var Box_1 = require("../../layout/Box/Box");
var Container_1 = require("../../layout/Container/Container");
var Section = function (_a) {
    var _b;
    var _c = _a.container, container = _c === void 0 ? true : _c, children = _a.children, boxProps = __rest(_a, ["container", "children"]);
    return (<Box_1.Box {...boxProps} as={(_b = boxProps.as) !== null && _b !== void 0 ? _b : 'section'}>
    {container ? <Container_1.default>{children}</Container_1.default> : children}
  </Box_1.Box>);
};
Section.displayName = 'Section';
exports.default = Section;
