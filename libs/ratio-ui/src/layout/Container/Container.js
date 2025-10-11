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
exports.CONTAINER_CLASSES = void 0;
var react_1 = require("react");
exports.CONTAINER_CLASSES = 'p-3 container mx-auto';
var Container = function (_a) {
    var children = _a.children, _b = _a.as, Component = _b === void 0 ? 'div' : _b, _c = _a.className, className = _c === void 0 ? '' : _c, rest = __rest(_a, ["children", "as", "className"]);
    return (<Component className={"".concat(exports.CONTAINER_CLASSES, " ").concat(className)} {...rest}>
      {children}
    </Component>);
};
exports.default = Container;
