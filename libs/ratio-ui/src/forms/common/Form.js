"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form = void 0;
var utils_1 = require("@eventuras/utils");
var defaultFormClassName = 'pt-6 pb-8 mb-4';
var Form = function (props) {
    var _a;
    var _b;
    return (<form action={props.action} onSubmit={props.onSubmit} className={(_b = props.className) !== null && _b !== void 0 ? _b : defaultFormClassName} {..._a = {}, _a[utils_1.DATA_TEST_ID] = props[utils_1.DATA_TEST_ID], _a}>
        {props.children}
      </form>);
};
exports.Form = Form;
