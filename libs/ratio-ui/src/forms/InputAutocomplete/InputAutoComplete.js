'use client';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputAutoComplete = void 0;
var react_stately_1 = require("react-stately");
var react_1 = require("react");
var react_aria_components_1 = require("react-aria-components");
var Loading_1 = require("../../core/Loading/Loading");
var InputAutoComplete = function (props) {
    var createSet = function (values) { return ({ items: values }); };
    var localCache = (0, react_1.useRef)(new Map());
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var list = (0, react_stately_1.useAsyncList)({
        load: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var cacheHit, res;
                var filterText = _b.filterText;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if ((filterText !== null && filterText !== void 0 ? filterText : '').length < props.minimumAmountOfCharacters) {
                                return [2 /*return*/, createSet([
                                        {
                                            id: -1,
                                            label: "Type at least ".concat(props.minimumAmountOfCharacters, " characters"),
                                            original: null
                                        }
                                    ])];
                            }
                            cacheHit = localCache.current.get(filterText);
                            if (cacheHit) {
                                return [2 /*return*/, createSet(cacheHit)];
                            }
                            setLoading(true);
                            return [4 /*yield*/, props.dataProvider(filterText !== null && filterText !== void 0 ? filterText : '')];
                        case 1:
                            res = _c.sent();
                            setLoading(false);
                            if (res.ok) {
                                localCache.current.set(filterText, res.value);
                                return [2 /*return*/, createSet(res.value)];
                            }
                            else {
                                return [2 /*return*/, createSet([])];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
    });
    return <div>
    <react_aria_components_1.ComboBox className="group flex flex-col p-4" items={list.items} inputValue={list.filterText} disabledKeys={[-1]} onInputChange={function (value) { list.setFilterText(value); }} onSelectionChange={function (key) {
            if (props.onItemSelected) {
                var item = list.items.filter(function (i) { return i.id === key; })[0];
                if (item) {
                    props.onItemSelected(item.original);
                }
            }
            return key;
        }} allowsCustomValue menuTrigger='focus'>
      <react_aria_components_1.Label className="text-black cursor-default">{props.placeholder}</react_aria_components_1.Label>
      <div className="flex flex-row">
        <react_aria_components_1.Input className="border-none py-2 pl-3 pr-2 text-sm leading-5 text-gray-900"/>

        {!loading ? <react_aria_components_1.Button className="text-white p-2 bg-primary-600">▼</react_aria_components_1.Button> : <div className="scale-[0.8] top-[-5px]">
            <Loading_1.default />
          </div>}
      </div>
      <react_aria_components_1.Popover className="ml-[-12px] max-h-60 w-(--trigger-width) overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
        <react_aria_components_1.ListBox className="outline-hidden">
          {function (item) { return <react_aria_components_1.ListBoxItem textValue={item.label} className="group flex items-center gap-2 cursor-default select-none py-2 pl-2 pr-4 outline-hidden rounded-xs text-gray-900 focus:bg-sky-600 focus:text-white" id={item.id} key={item.id}>
            {props.itemRenderer ? props.itemRenderer(item) : item.label}

          </react_aria_components_1.ListBoxItem>; }}
        </react_aria_components_1.ListBox>
      </react_aria_components_1.Popover>
    </react_aria_components_1.ComboBox>
  </div>;
};
exports.InputAutoComplete = InputAutoComplete;
