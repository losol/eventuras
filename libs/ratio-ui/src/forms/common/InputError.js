"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputError = void 0;
var react_1 = require("react");
var InputError = function (_a) {
    var _b;
    var errors = _a.errors, name = _a.name, _c = _a.className, className = _c === void 0 ? 'text-red-500' : _c;
    var errorMessage = (_b = errors === null || errors === void 0 ? void 0 : errors[name]) === null || _b === void 0 ? void 0 : _b.message;
    if (!errorMessage)
        return null;
    return (<label htmlFor={name} role="alert" className={className}>
      {errorMessage}
    </label>);
};
exports.InputError = InputError;
