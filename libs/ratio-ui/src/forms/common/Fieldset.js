"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fieldset = exports.styles = void 0;
var react_1 = require("react");
exports.styles = {
    fieldsetClassName: 'text-lg pt-3 pb-6',
    legendClassName: 'text-lg border-b-2 pt-4 pb-2',
};
var Fieldset = function (props) {
    var _a, _b;
    return (<fieldset disabled={props.disabled} className={(_a = props.className) !== null && _a !== void 0 ? _a : exports.styles.fieldsetClassName}>
    {props.label && (<legend className={(_b = props.legendClassName) !== null && _b !== void 0 ? _b : exports.styles.legendClassName}>{props.label}</legend>)}
    {props.children}
  </fieldset>);
};
exports.Fieldset = Fieldset;
