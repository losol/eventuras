"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var icons_1 = require("../icons");
var __1 = require("../..");
var react_1 = require("react");
var Drawer = function (props) {
    var validChildren = react_1.default.Children.toArray(props.children);
    var filteredChildren = validChildren
        .map(function (child) {
        if (react_1.default.isValidElement(child)) {
            return child;
        }
        return null; // Ignore other types of children
    })
        .filter(Boolean);
    var ariaHiddenProps = props.isOpen
        ? {}
        : { 'aria-hidden': 'true' };
    var styles = {
        drawer: {
            base: 'flex flex-col p-6 fixed top-0 right-0 w-11/12 md:w-7/12 h-full bg-gray-100 dark:bg-slate-950 overflow-auto z-30',
            open: 'transition-opacity opacity-100 duration-2',
            closed: 'transition-all delay-500 opacity-0',
        },
    };
    return (<__1.Portal isOpen={props.isOpen} clickOutside={props.onCancel}>
      <div id="backdrop" className="fixed top-0 left-0 bg-cover z-10 w-screen h-screen backdrop-blur-xs"/>
      <section {...ariaHiddenProps} className={"".concat(styles.drawer.base, " ").concat(props.isOpen ? styles.drawer.open : styles.drawer.closed)}>
        {' '}
        {/* Cancel icon top right */}
        {props.onCancel && (<__1.Button onClick={props.onCancel} className="absolute top-0 right-0 m-4" variant="secondary">
            <icons_1.X />
          </__1.Button>)}
        {filteredChildren}
      </section>
    </__1.Portal>);
};
// Header component
var Header = function (props) {
    if (props.as) {
        return (<header>
        <__1.Heading {...props}>{props.children}</__1.Heading>
      </header>);
    }
    else {
        return <header {...props}>{props.children}</header>;
    }
};
// Body component
var Body = function (props) { return (<div role="main" className={"grow ".concat(props.className || '')}>
    {props.children}
  </div>); };
// Footer component
var Footer = function (props) { return (<footer className={"pt-8 ".concat(props.className)}>{props.children}</footer>); };
// Define valid child types
Drawer.Header = Header;
Drawer.Body = Body;
Drawer.Footer = Footer;
exports.default = Drawer;
