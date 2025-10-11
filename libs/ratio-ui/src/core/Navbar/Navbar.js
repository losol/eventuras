"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navbar = void 0;
var react_1 = require("react");
/**
 * Simple, responsive navbar.
 *
 * @see {@link NavbarProps}
 *
 */
var Navbar = function (_a) {
    var title = _a.title, children = _a.children, _b = _a.bgDark, bgDark = _b === void 0 ? false : _b, _c = _a.bgColor, bgColor = _c === void 0 ? 'bg-transparent' : _c, _d = _a.titleHref, titleHref = _d === void 0 ? '/' : _d, LinkComponent = _a.LinkComponent;
    var textColor = bgDark ? 'text-white' : 'text-black dark:text-white';
    var LinkTag = LinkComponent !== null && LinkComponent !== void 0 ? LinkComponent : 'a';
    return (<nav className={"".concat(bgColor, " z-10 dark:bg-slate-900 ").concat(textColor, " m-0 p-0")}>
      <div className="container flex flex-wrap items-center justify-between mx-auto py-2 px-3">
        {title && (<LinkTag href={titleHref} className={"text-2xl tracking-tight whitespace-nowrap ".concat(textColor)}>
          {title}
          </LinkTag>)}
        {children}
      </div>
    </nav>);
};
exports.Navbar = Navbar;
