"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Badge = function (_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.variant, variant = _c === void 0 ? 'neutral' : _c, _d = _a.block, block = _d === void 0 ? false : _d;
    var variantClass = '';
    if (variant === 'neutral') {
        variantClass = 'bg-gray-700 dark:bg-gray-800';
    }
    else if (variant === 'info') {
        variantClass = 'bg-blue-600 dark:bg-blue-800';
    }
    else if (variant === 'positive') {
        variantClass = 'bg-green-700 dark:bg-green-800';
    }
    else if (variant === 'negative') {
        variantClass = 'bg-red-600 dark:bg-red-800 text-white';
    }
    var blockClass = block ? 'block' : '';
    var allClasses = "\n    ".concat(blockClass, "\n    ").concat(variantClass, "\n    p-2 text-xs leading-none text-white rounded\n    ").concat(className, "\n  ").trim();
    return <span className={allClasses}>{children}</span>;
};
exports.default = Badge;
