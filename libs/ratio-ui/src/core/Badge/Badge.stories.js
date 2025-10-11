"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllVariants = exports.Block = exports.Negative = exports.Positive = exports.Info = exports.Neutral = void 0;
var Badge_1 = require("./Badge");
var meta = {
    title: 'Core/Badge',
    component: Badge_1.default,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['neutral', 'info', 'positive', 'negative'],
        },
        block: { control: 'boolean' },
    },
};
exports.default = meta;
exports.Neutral = {
    args: {
        children: 'Neutral badge',
        variant: 'neutral',
    },
};
exports.Info = {
    args: {
        children: 'Info badge',
        variant: 'info',
    },
};
exports.Positive = {
    args: {
        children: 'Success!',
        variant: 'positive',
    },
};
exports.Negative = {
    args: {
        children: 'Error',
        variant: 'negative',
    },
};
exports.Block = {
    args: {
        children: 'Block badge',
        variant: 'info',
        block: true,
    },
};
exports.AllVariants = {
    render: function () { return (<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge_1.default variant="neutral">Neutral badge</Badge_1.default>
      <Badge_1.default variant="info">Info badge</Badge_1.default>
      <Badge_1.default variant="positive">Success!</Badge_1.default>
      <Badge_1.default variant="negative">Error badge</Badge_1.default>
    </div>); },
};
