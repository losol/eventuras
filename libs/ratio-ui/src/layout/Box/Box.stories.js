"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Combined = exports.CustomElement = exports.WithMargin = exports.WithPadding = exports.Default = void 0;
var react_1 = require("react");
var Box_1 = require("./Box");
var meta = {
    component: Box_1.Box,
    title: 'Layout/Box',
    tags: ['autodocs'],
};
exports.default = meta;
var Default = function () { return <Box_1.Box>Default Box</Box_1.Box>; };
exports.Default = Default;
var WithPadding = function () { return <Box_1.Box padding="20px">Box with Padding</Box_1.Box>; };
exports.WithPadding = WithPadding;
var WithMargin = function () { return <Box_1.Box margin="20px">Box with Margin</Box_1.Box>; };
exports.WithMargin = WithMargin;
var CustomElement = function () { return (<Box_1.Box as="section">
    Box as a <section></section>
  </Box_1.Box>); };
exports.CustomElement = CustomElement;
var Combined = function () { return (<>
    <Box_1.Box>Default Box</Box_1.Box>
    <Box_1.Box padding="20px">Box with Padding</Box_1.Box>
    <Box_1.Box margin="20px">Box with Margin</Box_1.Box>
    <Box_1.Box as="section">
      Box as a <section></section>
    </Box_1.Box>
  </>); };
exports.Combined = Combined;
