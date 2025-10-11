"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Multiline = exports.WithError = exports.Disabled = exports.Default = void 0;
var Input_1 = require("./Input");
var meta = {
    title: 'Forms/Input',
    component: Input_1.Input,
    tags: ['autodocs'],
    argTypes: {
        label: { control: 'text' },
        description: { control: 'text' },
        placeholder: { control: 'text' },
        disabled: { control: 'boolean' },
        multiline: { control: 'boolean' },
    },
};
exports.default = meta;
/** Default text input */
exports.Default = {
    args: {
        name: 'firstName',
        label: 'First Name',
        placeholder: 'Enter your first name',
        description: 'This is a standard text input',
    },
};
/** Disabled input */
exports.Disabled = {
    args: {
        name: 'firstName',
        label: 'First Name',
        placeholder: 'Disabled input',
        disabled: true,
    },
};
/** With error message */
exports.WithError = {
    args: {
        name: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        errors: { email: 'Invalid email address' },
    },
};
/** Multiline textarea */
exports.Multiline = {
    args: {
        name: 'bio',
        label: 'Bio',
        placeholder: 'Write something about yourself...',
        description: 'This field allows multiple lines.',
        multiline: true,
        rows: 4,
    },
};
