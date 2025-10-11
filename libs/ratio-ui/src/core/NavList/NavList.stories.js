"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scrollable = exports.Sticky = exports.Default = void 0;
var react_1 = require("react");
var NavList_1 = require("./NavList");
var sampleItems = [
    { href: '#overview', title: 'Overview' },
    { href: '#features', title: 'Features' },
    { href: '#pricing', title: 'Pricing' },
    { href: '#faq', title: 'FAQ' },
];
var meta = {
    title: 'NavList',
    component: NavList_1.NavList,
    argTypes: {
        sticky: { control: 'boolean' },
    },
};
exports.default = meta;
exports.Default = {
    args: {
        items: sampleItems,
        LinkComponent: function (props) { return <a {...props}/>; },
        sticky: false,
    },
};
exports.Sticky = {
    args: {
        items: sampleItems,
        LinkComponent: function (props) { return <a {...props}/>; },
        sticky: true,
    },
    render: function (args) { return (<div style={{ height: '200vh' /* make page tall */ }}>
      <NavList_1.NavList {...args}/>
      <div style={{ padding: '2rem' }}>
        {/* Dummy sections to scroll through */}
        <section id="overview" style={{ height: '50vh' }}>
          <h2>Overview</h2>
          <p>Lots of content here…</p>
        </section>
        <section id="features" style={{ height: '50vh' }}>
          <h2>Features</h2>
          <p>More content here…</p>
        </section>
        <section id="pricing" style={{ height: '50vh' }}>
          <h2>Pricing</h2>
          <p>Even more content…</p>
        </section>
        <section id="faq" style={{ height: '50vh' }}>
          <h2>FAQ</h2>
          <p>And some final content…</p>
        </section>
      </div>
    </div>); },
};
exports.Scrollable = {
    args: {
        items: Array.from({ length: 10 }, function (_, i) { return ({
            href: "#item-".concat(i + 1),
            title: "Linkitem ".concat(i + 1),
        }); }),
        LinkComponent: function (props) { return <a {...props}/>; },
        sticky: false,
    },
};
