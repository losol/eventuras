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
exports.DebouncedInput = void 0;
var react_1 = require("react");
var formStyles_1 = require("../styles/formStyles");
var DebouncedInput = function (_a) {
    var initialValue = _a.value, onChange = _a.onChange, className = _a.className, _b = _a.debounce, debounce = _b === void 0 ? 500 : _b, props = __rest(_a, ["value", "onChange", "className", "debounce"]);
    var _c = react_1.default.useState(initialValue), value = _c[0], setValue = _c[1];
    react_1.default.useEffect(function () {
        setValue(initialValue);
    }, [initialValue]);
    react_1.default.useEffect(function () {
        var timeout = setTimeout(function () {
            onChange(value);
        }, debounce);
        return function () { return clearTimeout(timeout); };
    }, [value]);
    return (<input {...props} className={className !== null && className !== void 0 ? className : formStyles_1.formStyles.defaultInputStyle} value={value} onChange={function (e) { return setValue(e.target.value); }}/>);
};
exports.DebouncedInput = DebouncedInput;
