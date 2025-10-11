"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithCustomStyles = exports.Disabled = exports.CheckedByDefault = exports.Default = void 0;
var react_1 = require("react");
var Checkbox_1 = require("./Checkbox");
var meta = {
    title: 'Inputs/Checkbox',
    component: Checkbox_1.default,
    tags: ['autodocs'],
};
exports.default = meta;
var Default = function () { return (<Checkbox_1.default id="default" defaultChecked={false} disabled={false}>
    <Checkbox_1.default.Label>Label Here</Checkbox_1.default.Label>
    <Checkbox_1.default.Description>Description Here</Checkbox_1.default.Description>
  </Checkbox_1.default>); };
exports.Default = Default;
var CheckedByDefault = function () { return (<Checkbox_1.default id="checked-by-default" defaultChecked={true} disabled={false}>
    <Checkbox_1.default.Label>Label Here</Checkbox_1.default.Label>
    <Checkbox_1.default.Description>Description Here</Checkbox_1.default.Description>
  </Checkbox_1.default>); };
exports.CheckedByDefault = CheckedByDefault;
var Disabled = function () { return (<Checkbox_1.default id="disabled" defaultChecked={false} disabled={true}>
    <Checkbox_1.default.Label>Label Here</Checkbox_1.default.Label>
    <Checkbox_1.default.Description>Description Here</Checkbox_1.default.Description>
  </Checkbox_1.default>); };
exports.Disabled = Disabled;
var WithCustomStyles = function () { return (<Checkbox_1.default id="custom" className="w-6 h-6 text-red-600 bg-red-100" containerClassName="my-4">
    <Checkbox_1.default.Label className="font-bold ml-2 text-red-500">Label Here</Checkbox_1.default.Label>
    <Checkbox_1.default.Description>Description Here</Checkbox_1.default.Description>
  </Checkbox_1.default>); };
exports.WithCustomStyles = WithCustomStyles;
