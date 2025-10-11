"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithChildren = exports.DarkBg = exports.Default = void 0;
var Navbar_1 = require("./Navbar");
var meta = {
    title: 'Navbar',
    component: Navbar_1.Navbar,
    tags: ['autodocs'],
};
exports.default = meta;
exports.Default = {
    args: { title: 'Eventuras Inc.' },
};
/** Dark background + white text */
exports.DarkBg = {
    args: {
        title: 'Eventuras Inc.',
        bgDark: true,
        bgColor: 'bg-slate-900',
    },
};
/** With right‑side links / buttons */
exports.WithChildren = {
    render: function (args) { return (<Navbar_1.Navbar {...args}>
      {/* Any React node(s) */}
      <a href="/about" className="px-3">
        About
      </a>
      <button className="btn-primary ml-2">Sign up</button>
    </Navbar_1.Navbar>); },
    args: { title: 'Acme Inc.' },
};
