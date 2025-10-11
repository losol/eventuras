"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = void 0;
var image_1 = require("next/image");
var Image_1 = require("../../core/Image");
var NextImageRenderer = function (p) {
    // Ensure alt is defined for NextImage
    var _a = p.alt, alt = _a === void 0 ? '' : _a, rest = __rest(p, ["alt"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <image_1.default alt={alt} {...rest}/>;
};
var Image = function (props) {
    var _a;
    var imgClassName = (_a = props.imgClassName) !== null && _a !== void 0 ? _a : 'h-auto max-w-full';
    return <Image_1.Image {...props} renderer={NextImageRenderer} imgClassName={imgClassName}/>;
};
exports.Image = Image;
