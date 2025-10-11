// integrations/next/Link.tsx
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = void 0;
var react_1 = require("react");
var link_1 = require("next/link");
var Link_1 = require("../../core/Link/Link");
exports.Link = react_1.default.forwardRef(function (props, ref) { return (<Link_1.Link component={link_1.default} ref={ref} {...props}/>); });
exports.Link.displayName = 'NextLink';
exports.default = exports.Link;
