"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Large = exports.Small = exports.Playground = void 0;
var Unauthorized_1 = require("./Unauthorized");
/** See: {@link Unauthorized} props (`homeUrl`, `variant`) */
var meta = {
    // ➜ Folder in the sidebar
    title: 'Blocks/Unauthorized',
    // ➜ Component under test
    component: Unauthorized_1.Unauthorized,
    // ➜ Tweak controls in the UI
    argTypes: {
        variant: {
            control: { type: 'inline-radio' },
            options: ['small', 'large'],
        },
        homeUrl: { control: 'text' },
    },
    // ➜ Default args used by “Playground”
    args: {
        homeUrl: '/',
        variant: 'large',
    },
};
exports.default = meta;
/** ➜ Interactive playground */
exports.Playground = {};
/** ➜ Compact section variant */
exports.Small = {
    args: { variant: 'small' },
};
/** ➜ Spacious section variant */
exports.Large = {
    args: { variant: 'large' },
};
