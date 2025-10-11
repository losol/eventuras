"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LongContent = exports.WithTriggerButton = exports.Default = void 0;
var react_1 = require("react");
var Dialog_1 = require("./Dialog");
var Button_1 = require("../../core/Button");
var meta = {
    title: 'Layout/Dialog',
    component: Dialog_1.Dialog,
    args: {
        title: 'Example Dialog',
        children: <p>This is a dialog body.</p>,
        isOpen: true,
    },
};
exports.default = meta;
/**
 * Helper wrapper to handle open/close state
 */
var StatefulDialog = function (args) {
    var _a = (0, react_1.useState)(false), open = _a[0], setOpen = _a[1];
    return (<div>
      {/* Open dialog button */}
      <Button_1.Button onClick={function () { return setOpen(true); }}>Open Dialog</Button_1.Button>

      {/* Dialog with state control */}
      <Dialog_1.Dialog {...args} isOpen={open} onClose={function () { return setOpen(false); }}/>
    </div>);
};
/**
 * Default open dialog
 */
exports.Default = {
    args: {
        title: 'Default Dialog',
        children: (<div>
        <p>This is the default dialog content.</p>
      </div>),
    },
};
/**
 * Dialog opened via button click
 */
exports.WithTriggerButton = {
    render: function (args) { return <StatefulDialog {...args}/>; },
    args: {
        title: 'Interactive Dialog',
        children: (<>
        <p>Click outside or press ESC to close.</p>
        <p>You can put any JSX inside here.</p>
      </>),
    },
};
/**
 * Dialog with long scrolling content
 */
exports.LongContent = {
    render: function (args) { return <StatefulDialog {...args}/>; },
    args: {
        title: 'Dialog with Long Content',
        children: (<div className="space-y-4">
        {__spreadArray([], Array(20), true).map(function (_, i) { return (<p key={i}>This is line {i + 1} inside a long dialog.</p>); })}
      </div>),
    },
};
