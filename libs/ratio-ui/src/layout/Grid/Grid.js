"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var getGridCols = function (cols) {
    if (!cols)
        return '';
    return [
        cols.sm ? "sm:grid-cols-".concat(cols.sm) : '',
        cols.md ? "md:grid-cols-".concat(cols.md) : '',
        cols.lg ? "lg:grid-cols-".concat(cols.lg) : '',
    ].join(' ');
};
var Grid = function (_a) {
    var _b = _a.cols, cols = _b === void 0 ? { md: 2, lg: 3 } : _b, paddingClassName = _a.paddingClassName, wrapperClassName = _a.wrapperClassName, container = _a.container, children = _a.children;
    var containerClass = container ? 'container' : '';
    var additionalClasses = paddingClassName || '';
    var gridCols = getGridCols(cols);
    var content = (<div className={"grid ".concat(gridCols, " gap-2 ").concat(containerClass, " ").concat(additionalClasses)}>
      {children}
    </div>);
    return wrapperClassName ? <div className={wrapperClassName}>{content}</div> : content;
};
exports.default = Grid;
