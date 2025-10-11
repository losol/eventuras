"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Input = void 0;
var react_1 = require("react");
var formStyles_1 = require("../styles/formStyles");
var InputLabel_1 = require("../common/InputLabel");
var InputError_1 = require("../common/InputError");
var InputDescription_1 = require("../common/InputDescription");
var utils_1 = require("@eventuras/utils");
exports.Input = (0, react_1.forwardRef)(function (_a, forwardedRef) {
    var _b;
    var _c;
    var name = _a.name, _d = _a.type, type = _d === void 0 ? 'text' : _d, placeholder = _a.placeholder, label = _a.label, description = _a.description, className = _a.className, errors = _a.errors, disabled = _a.disabled, _e = _a.multiline, multiline = _e === void 0 ? false : _e, rows = _a.rows, cols = _a.cols, _f = _a.noMargin, noMargin = _f === void 0 ? false : _f, _g = _a.noWrapper, noWrapper = _g === void 0 ? false : _g, rest = __rest(_a, ["name", "type", "placeholder", "label", "description", "className", "errors", "disabled", "multiline", "rows", "cols", "noMargin", "noWrapper"]);
    var hasError = errors && errors[name];
    var inputClassName = "".concat(className !== null && className !== void 0 ? className : formStyles_1.formStyles.defaultInputStyle, " ").concat(hasError ? formStyles_1.formStyles.inputErrorGlow : '', " ").concat(disabled ? 'cursor-not-allowed' : '');
    if (multiline) {
        inputClassName = "".concat(inputClassName, " ").concat(formStyles_1.formStyles.textarea);
    }
    var id = (_c = rest.id) !== null && _c !== void 0 ? _c : name;
    var assignRef = function (element) {
        if (typeof forwardedRef === 'function') {
            forwardedRef(element);
        }
        else if (forwardedRef && 'current' in forwardedRef) {
            forwardedRef.current = element;
        }
    };
    var commonProps = __assign({ id: id, className: inputClassName, placeholder: placeholder, disabled: disabled, 'aria-invalid': hasError ? true : undefined, name: name }, rest);
    var inputElement = multiline ? (<textarea ref={assignRef} rows={rows !== null && rows !== void 0 ? rows : 3} // ✅ keep rows for initial height
     {...commonProps} {..._b = {}, _b[utils_1.DATA_TEST_ID] = commonProps[utils_1.DATA_TEST_ID], _b}/>) : (<input ref={assignRef} type={type} {...commonProps}/>);
    var content = (<>
        {label && <InputLabel_1.InputLabel htmlFor={id}>{label}</InputLabel_1.InputLabel>}
        {description && <InputDescription_1.InputDescription>{description}</InputDescription_1.InputDescription>}
        {inputElement}
        {hasError && <InputError_1.InputError errors={errors} name={name}/>}
      </>);
    if (noWrapper) {
        return content;
    }
    return <div className={formStyles_1.formStyles.inputWrapper}>{content}</div>;
});
exports.Input.displayName = 'TextInput';
