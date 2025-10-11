"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTarget = exports.ClosedPortal = exports.Default = void 0;
var react_1 = require("react");
var Portal_1 = require("./Portal"); // Update the import path based on your project structure
var meta = {
    component: Portal_1.default,
    parameters: {
        tags: ['autodocs'],
        docs: {
            description: {
                component: 'A Portal component for rendering content outside the current DOM hierarchy.',
                target: 'The ID of the target DOM element where the portal content will be rendered. If not provided, it defaults to "__next".',
            },
        },
    },
};
exports.default = meta;
var Default = function () { return (<Portal_1.default isOpen={true}>
    <div>This content is inside the portal.</div>
  </Portal_1.default>); };
exports.Default = Default;
var ClosedPortal = function () { return (<Portal_1.default isOpen={false}>
    <div>This content will not be rendered.</div>
  </Portal_1.default>); };
exports.ClosedPortal = ClosedPortal;
var CustomTarget = function () { return (<Portal_1.default isOpen={true} target="custom-root">
    <div>This content is rendered in a custom target element.</div>
  </Portal_1.default>); };
exports.CustomTarget = CustomTarget;
