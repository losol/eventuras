"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailingValidation = exports.Playground = exports.Default = void 0;
var react_1 = require("react");
var PhoneInput_1 = require("./PhoneInput");
var meta = {
    title: 'Forms/PhoneInput',
    component: PhoneInput_1.PhoneInput,
    tags: ['autodocs'],
    argTypes: {
        label: { control: 'text' },
        description: { control: 'text' },
        disabled: { control: 'boolean' },
    },
};
exports.default = meta;
var errorMessages = {
    onlyDigits: 'Only digits are allowed',
    minLength: 'Phone number must be at least 6 digits',
    maxLength: 'Phone number must be at most 15 digits',
};
var DemoWrapper = function (_a) {
    var children = _a.children, value = _a.value;
    return (<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {children}
    <div>
      <strong>Live Value:</strong> {value !== null && value !== void 0 ? value : '—'}
    </div>
  </div>);
};
/** Default usage with Norway preselected */
exports.Default = {
    args: {
        label: 'Phone Number',
        description: 'Select your country',
    },
};
/** Playground showing live changes in the Storybook canvas */
exports.Playground = {
    render: function (args) {
        var _a = (0, react_1.useState)(null), value = _a[0], setValue = _a[1];
        return (<DemoWrapper value={value}>
        <PhoneInput_1.PhoneInput {...args} onChange={function (_a) {
                var fullNumber = _a.fullNumber, localNumber = _a.localNumber;
                setValue(localNumber.trim() === '' ? null : fullNumber);
            }}/>
      </DemoWrapper>);
    },
    args: {
        label: 'Phone Number',
        description: 'Type a number to see live output',
    },
};
/** Validation example: shows an error when invalid characters are typed */
exports.FailingValidation = {
    render: function (args) {
        var _a = (0, react_1.useState)(null), value = _a[0], setValue = _a[1];
        var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
        var validate = function (localNumber) {
            if (/[^0-9]/.test(localNumber))
                return errorMessages.onlyDigits;
            if (localNumber && localNumber.length < 6)
                return errorMessages.minLength;
            if (localNumber.length > 15)
                return errorMessages.maxLength;
            return null;
        };
        return (<DemoWrapper value={value}>
        <PhoneInput_1.PhoneInput {...args} errors={error ? { phone: { message: error } } : {}} onChange={function (_a) {
                var localNumber = _a.localNumber, fullNumber = _a.fullNumber;
                var validationResult = validate(localNumber);
                setError(typeof validationResult === 'string' ? validationResult : null);
                setValue(localNumber.trim() === '' ? null : fullNumber);
            }}/>
      </DemoWrapper>);
    },
    args: {
        name: 'phone',
        label: 'Phone Number',
        description: 'Try typing + or letters to see validation in action',
    },
};
