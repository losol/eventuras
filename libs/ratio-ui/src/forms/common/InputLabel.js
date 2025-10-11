"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputLabel = void 0;
var react_1 = require("react");
var styles = {
    label: 'block font-bold mb-2',
};
/**
 * Renders a label element with optional custom styling.
 *
 * Designed to be used in conjunction with input elements, it provides an accessible
 * and stylized way to label forms. If no children are provided, the component renders
 * `null` to avoid rendering an empty label element.
 *
 * @param {LabelProps} props - The properties passed to the label component.
 * @returns {React.ReactElement | null} The Label component or null if no children are provided.
 */
var InputLabel = function (_a) {
    var children = _a.children, className = _a.className, htmlFor = _a.htmlFor;
    if (!children)
        return null;
    return (<label htmlFor={htmlFor} className={className !== null && className !== void 0 ? className : styles.label}>
      {children}
    </label>);
};
exports.InputLabel = InputLabel;
