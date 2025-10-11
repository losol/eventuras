"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level6 = exports.Level5 = exports.Level4 = exports.Level3 = exports.Level2 = exports.Level1 = void 0;
var react_1 = require("react");
var Heading_1 = require("./Heading");
var meta = {
    component: Heading_1.default,
    tags: ['autodocs'],
};
exports.default = meta;
// Define a function that returns a JSX element of the Heading component
var renderHeading = function (args) { return <Heading_1.default {...args}/>; };
var Level1 = function () {
    return renderHeading({
        as: 'h1',
        children: 'Heading Level 1',
    });
};
exports.Level1 = Level1;
var Level2 = function () {
    return renderHeading({
        as: 'h2',
        children: 'Heading Level 2',
    });
};
exports.Level2 = Level2;
var Level3 = function () {
    return renderHeading({
        as: 'h3',
        children: 'Heading Level 3',
    });
};
exports.Level3 = Level3;
var Level4 = function () {
    return renderHeading({
        as: 'h4',
        children: 'Heading Level 4',
    });
};
exports.Level4 = Level4;
var Level5 = function () {
    return renderHeading({
        as: 'h5',
        children: 'Heading Level 5',
    });
};
exports.Level5 = Level5;
var Level6 = function () {
    return renderHeading({
        as: 'h6',
        children: 'Heading Level 6',
    });
};
exports.Level6 = Level6;
