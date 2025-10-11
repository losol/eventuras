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
var ButtonGroup = function (_a) {
    var children = _a.children, spacingProps = __rest(_a, ["children"]);
    var baseClassName = 'inline-flex';
    var className = [baseClassName, (0, Box_1.buildSpacingClasses)(spacingProps)].join(' ');
    return (<div className={className} role="group">
      {children}
    </div>);
};
exports.default = ButtonGroup;
