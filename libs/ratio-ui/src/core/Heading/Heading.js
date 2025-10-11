"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var Heading = function (props) {
    var _a, _b, _c, _d;
    var HeadingComponent = (_a = props.as) !== null && _a !== void 0 ? _a : 'h1';
    var onDark = (_b = props.onDark) !== null && _b !== void 0 ? _b : false;
    // Adjust font size based on heading level
    var textSize = 'text-base';
    switch (HeadingComponent) {
        case 'h1':
            textSize = 'text-6xl';
            break;
        case 'h2':
            textSize = 'text-3xl';
            break;
        case 'h3':
            textSize = 'text-2xl';
            break;
        default:
            textSize = 'text-base';
            break;
    }
    // Adjust padding based on heading level
    var defaultPadding = 'pt-6 pb-0';
    switch (HeadingComponent) {
        case 'h1':
            defaultPadding = 'pt-18 pb-6';
            break;
        case 'h2':
            defaultPadding = 'pt-12 pb-3';
            break;
        case 'h3':
            defaultPadding = 'pt-19 pb-3';
            break;
        default:
            break;
    }
    var baseClassName = (_c = props.className) !== null && _c !== void 0 ? _c : textSize;
    var textColor = onDark ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200';
    var spacing = (_d = props.padding) !== null && _d !== void 0 ? _d : defaultPadding;
    var headingClassName = "".concat(baseClassName, " ").concat(spacing, " ").concat(textColor);
    return (<>
      <HeadingComponent className={headingClassName}>{props.children}</HeadingComponent>
    </>);
};
exports.default = Heading;
