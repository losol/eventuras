"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithCustomRenderer = exports.ResponsiveClasses = exports.WithDimensions = exports.ForceFigureNoCaption = exports.WithCaption = exports.DefaultImg = void 0;
var react_1 = require("react");
var Image_1 = require("./Image");
// ✅ Basic meta
var meta = {
    title: 'Media/Image',
    component: Image_1.Image,
    args: {
        // Default demo image
        src: 'https://picsum.photos/seed/mountains/800/500',
        alt: 'Demo image',
    },
    argTypes: {
        as: { control: 'inline-radio', options: ['img', 'figure'] },
    },
};
exports.default = meta;
// ————————————————————————————————————————————————————————————————
// Default <img> (no figure)
// ————————————————————————————————————————————————————————————————
exports.DefaultImg = {
    args: {
        imgClassName: 'h-auto max-w-full rounded-2xl shadow',
    },
};
// ————————————————————————————————————————————————————————————————
// Auto-figure when caption is present
// ————————————————————————————————————————————————————————————————
exports.WithCaption = {
    args: {
        caption: 'A calm view over the valley at dusk.',
        wrapperClassName: 'max-w-xl py-6',
        figCaptionClassName: 'mt-2 text-sm text-center text-gray-600',
        imgClassName: 'h-auto w-full rounded-xl',
    },
};
// ————————————————————————————————————————————————————————————————
// Force figure without caption
// ————————————————————————————————————————————————————————————————
exports.ForceFigureNoCaption = {
    args: {
        as: 'figure',
        wrapperClassName: 'max-w-lg py-8',
        imgClassName: 'h-auto w-full rounded-md ring-1 ring-black/10',
    },
};
// ————————————————————————————————————————————————————————————————
// Forward intrinsic width/height to renderer
// ————————————————————————————————————————————————————————————————
exports.WithDimensions = {
    args: {
        width: 640,
        height: 360,
        imgClassName: 'h-auto rounded-lg border',
    },
};
// ————————————————————————————————————————————————————————————————
// Responsive utility classes on wrapper + image
// ————————————————————————————————————————————————————————————————
exports.ResponsiveClasses = {
    args: {
        wrapperClassName: 'mx-auto max-w-[480px] sm:max-w-[640px] md:max-w-[768px] py-6',
        imgClassName: 'h-auto w-full rounded-2xl',
        caption: 'Responsive wrapper width (Tailwind utilities).',
    },
};
// ————————————————————————————————————————————————————————————————
// Custom renderer example (e.g. Next.js <Image/> shim)
// ————————————————————————————————————————————————————————————————
var MockNextImage = function (p) {
    // Pretend to be next/image
    // (keeps the same prop surface as ImageRendererProps)
    return (
    // Use native img underneath for Storybook
    <img 
    // Map through common props
    alt={p.alt} width={p.width} height={p.height} className={p.className} loading="eager" decoding="async" 
    // Pass-through any extra props
    {...p}/>);
};
exports.WithCustomRenderer = {
    args: {
        renderer: MockNextImage,
        rendererProps: { sizes: '(min-width: 768px) 640px, 100vw', priority: true },
        width: 800,
        height: 500,
        imgClassName: 'h-auto w-full rounded-xl',
        caption: 'Rendered with a custom renderer (Mock NextImage).',
    },
};
