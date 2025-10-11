"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = Image;
var react_1 = require("react");
/**
 * Generic Image with optional figure/caption semantics and pluggable renderer.
 * - Default: renders <img|renderer>.
 * - as="figure": wraps in <figure>.
 * - caption: always wraps in <figure> with <figcaption>.
 * @see ImageProps
 * @see ImageRendererProps
 */
function Image(props) {
    var _a, _b, _c, _d, _e, _f;
    // pick renderer or native <img>
    var Img = (_a = props.renderer) !== null && _a !== void 0 ? _a : (function (p) { return (
    // native img fallback
    <img loading="lazy" decoding="async" {...p}/>); });
    // common image props
    var imgProps = __assign({ src: props.src, alt: (_b = props.alt) !== null && _b !== void 0 ? _b : '', width: props.width, height: props.height, className: (_c = props.imgClassName) !== null && _c !== void 0 ? _c : 'h-auto max-w-full' }, ((_d = props.rendererProps) !== null && _d !== void 0 ? _d : {}));
    // decide wrapper semantics
    var mustBeFigure = Boolean(props.caption) || props.as === 'figure';
    // render figure variant
    if (mustBeFigure) {
        // wrapper class
        var wrapper = (_e = props.wrapperClassName) !== null && _e !== void 0 ? _e : 'max-w-lg py-8';
        // caption class
        var cap = (_f = props.figCaptionClassName) !== null && _f !== void 0 ? _f : 'mt-2 text-sm text-center text-gray-500 dark:text-gray-400';
        return (<figure className={wrapper}>
        <Img {...imgProps}/>
        {props.caption ? (<figcaption className={cap}>
            <p>{props.caption}</p>
          </figcaption>) : null}
      </figure>);
    }
    // render simple image (no figure)
    return <Img {...imgProps}/>;
}
