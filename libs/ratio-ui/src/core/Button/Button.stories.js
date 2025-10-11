"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.ButtonTest = exports.AllCombinations = exports.TextButton = exports.Light = exports.Outline = exports.Secondary = exports.Primary = exports.Playground = void 0;
var icons_1 = require("../icons");
var test_1 = require("storybook/test");
var Button_1 = require("./Button");
var meta = {
    component: Button_1.default,
    tags: ['autodocs'],
    args: {
        variant: 'primary',
        disabled: false,
        loading: false,
        block: false,
        onDark: false,
        icon: false,
        children: 'Button',
        onClick: (0, test_1.fn)(),
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['primary', 'secondary', 'outline', 'light', 'text'],
        },
        disabled: { control: 'boolean' },
        loading: { control: 'boolean' },
        block: { control: 'boolean' },
        onDark: { control: 'boolean' },
        icon: {
            control: 'boolean',
            description: 'Toggle to show a Home icon before the label',
        },
        children: { control: 'text' },
    },
};
exports.default = meta;
var Template = function (_a) {
    var icon = _a.icon, args = __rest(_a, ["icon"]);
    return (<Button_1.default {...args} icon={icon ? <icons_1.Home strokeWidth={1}/> : undefined}/>);
};
exports.Playground = Template.bind({});
exports.Playground.storyName = 'Playground';
exports.Primary = Template.bind({});
exports.Primary.args = {
    variant: 'primary',
    children: 'Primary',
};
exports.Secondary = Template.bind({});
exports.Secondary.args = {
    variant: 'secondary',
    children: 'Secondary',
};
exports.Outline = Template.bind({});
exports.Outline.args = {
    variant: 'outline',
    children: 'Outline',
};
exports.Light = Template.bind({});
exports.Light.args = {
    variant: 'light',
    children: 'Light',
};
exports.TextButton = Template.bind({});
exports.TextButton.args = {
    variant: 'text',
    children: 'Text',
};
var AllCombinations = function () {
    var variants = [
        'primary',
        'secondary',
        'outline',
        'light',
        'text',
    ];
    var states = [
        { label: 'Default', props: {} },
        { label: 'Disabled', props: { disabled: true } },
        { label: 'Loading', props: { loading: true } },
        { label: 'With Icon', props: { icon: <icons_1.Home strokeWidth={1}/> } },
        {
            label: 'Icon + Loading',
            props: { icon: <icons_1.Home strokeWidth={1}/>, loading: true },
        },
        { label: 'On Dark', props: { onDark: true } },
    ];
    return (<div className="space-y-6">
      {variants.map(function (variant) { return (<div key={variant}>
          <h4 className="mb-2 font-semibold">{variant}</h4>
          <div className="flex flex-wrap gap-2">
            {states.map(function (_a) {
                var label = _a.label, props = _a.props;
                var btn = (<Button_1.default key={"".concat(variant, "-").concat(label)} variant={variant} {...props}>
                  {label}
                </Button_1.default>);
                // If this is the On Dark case, wrap in a black bg
                if (props.onDark) {
                    return (<div key={"".concat(variant, "-").concat(label)} className="bg-black p-2 rounded">
                    {btn}
                  </div>);
                }
                return btn;
            })}
          </div>
        </div>); })}
    </div>);
};
exports.AllCombinations = AllCombinations;
exports.AllCombinations.storyName = 'All Variants & States';
// Tests
// Module‑scoped spies so play() can see them
var enabledSpy;
var disabledSpy;
var loadingSpy;
exports.ButtonTest = {
    // Custom render that sets up three buttons
    render: function () {
        enabledSpy = (0, test_1.fn)();
        disabledSpy = (0, test_1.fn)();
        loadingSpy = (0, test_1.fn)();
        return (<div className="flex flex-col gap-2">
        <Button_1.default variant="primary" onClick={enabledSpy}>
          Default
        </Button_1.default>
        <Button_1.default variant="primary" disabled onClick={disabledSpy}>
          Disabled
        </Button_1.default>
        <Button_1.default variant="primary" loading onClick={loadingSpy}>
          Loading
        </Button_1.default>
      </div>);
    },
    // @ts-ignore
    play: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var canvas, btnDefault, btnDisabled, btnLoading;
        var canvasElement = _b.canvasElement;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    canvas = (0, test_1.within)(canvasElement);
                    btnDefault = canvas.getByRole('button', { name: 'Default' });
                    btnDisabled = canvas.getByRole('button', { name: 'Disabled' });
                    btnLoading = canvas.getByRole('button', { name: 'Loading' });
                    // 1) Default button calls its spy
                    return [4 /*yield*/, test_1.userEvent.click(btnDefault)];
                case 1:
                    // 1) Default button calls its spy
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(enabledSpy).toHaveBeenCalled()];
                case 2:
                    _c.sent();
                    // 2) Disabled button does *not* call its spy
                    return [4 /*yield*/, test_1.userEvent.click(btnDisabled)];
                case 3:
                    // 2) Disabled button does *not* call its spy
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(disabledSpy).not.toHaveBeenCalled()];
                case 4:
                    _c.sent();
                    // 3) Loading button does *not* call its spy
                    return [4 /*yield*/, test_1.userEvent.click(btnLoading)];
                case 5:
                    // 3) Loading button does *not* call its spy
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(loadingSpy).not.toHaveBeenCalled()];
                case 6:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); },
};
