"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPaddingAndMargin = exports.WithBackgroundImage = exports.WithContainer = exports.Dark = exports.Default = void 0;
var Card_1 = require("./Card");
var meta = {
    title: 'Core/Card',
    component: Card_1.Card,
    tags: ['autodocs'],
    argTypes: {
        dark: { control: 'boolean' },
        container: { control: 'boolean' },
        backgroundColorClass: { control: 'text' },
        backgroundImageUrl: { control: 'text' },
        padding: { control: 'text' },
        margin: { control: 'text' },
    },
};
exports.default = meta;
exports.Default = {
    args: {
        children: 'This is a default card.',
    },
};
exports.Dark = {
    args: {
        dark: true,
        children: 'This is a dark card.',
        backgroundColorClass: 'bg-slate-800',
    },
};
exports.WithContainer = {
    args: {
        container: true,
        children: 'This card wraps its children in a Container component.',
    },
};
exports.WithBackgroundImage = {
    args: {
        backgroundImageUrl: 'https://via.placeholder.com/400x200',
        children: 'Card with a background image.',
    },
};
exports.CustomPaddingAndMargin = {
    args: {
        padding: '8',
        margin: '4',
        children: 'Card with custom padding and margin.',
    },
};
