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
exports.CheckBoxDescription = exports.CheckBoxLabel = exports.checkboxStyles = void 0;
var react_1 = require("react");
exports.checkboxStyles = {
    container: 'my-2',
    checkbox: 'align-text-bottom w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600',
    label: 'font-bold ml-2 text-gray-900 dark:text-gray-300',
    description: 'ml-7 mt-2 text-sm',
};
var CheckBoxLabel = function (_a) {
    var children = _a.children, className = _a.className, htmlFor = _a.htmlFor;
    var labelClassName = className || exports.checkboxStyles.label;
    return (<label htmlFor={htmlFor} className={labelClassName}>
      {children}
    </label>);
};
exports.CheckBoxLabel = CheckBoxLabel;
var CheckBoxDescription = function (_a) {
    var children = _a.children, className = _a.className;
    var descriptionClassName = className || exports.checkboxStyles.description;
    return <p className={descriptionClassName}>{children}</p>;
};
exports.CheckBoxDescription = CheckBoxDescription;
var Checkbox = react_1.default.forwardRef(function (props, ref) {
    var className = props.className, containerClassName = props.containerClassName, children = props.children, id = props.id, disabled = props.disabled, defaultChecked = props.defaultChecked, dataTestId = props["data-test-id"], rest = __rest(props, ["className", "containerClassName", "children", "id", "disabled", "defaultChecked", 'data-test-id']);
    var checkboxClassName = className || exports.checkboxStyles.checkbox;
    var containerClass = containerClassName || exports.checkboxStyles.container;
    // Add the htmlFor attribute to the label
    var enhancedChildren = react_1.default.Children.map(children, function (child) {
        if (react_1.default.isValidElement(child) && child.type === exports.CheckBoxLabel) {
            return react_1.default.cloneElement(child, { htmlFor: id });
        }
        return child;
    });
    return (<div key={id} className={containerClass}>
      <input type="checkbox" className={checkboxClassName} ref={ref} id={id} disabled={disabled} defaultChecked={defaultChecked} data-test-id={dataTestId} {...rest}/>
      {enhancedChildren}
    </div>);
});
Checkbox.displayName = 'Checkbox';
Checkbox.Label = exports.CheckBoxLabel;
Checkbox.Description = exports.CheckBoxDescription;
exports.default = Checkbox;
