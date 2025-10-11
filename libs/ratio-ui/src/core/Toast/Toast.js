"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toast = exports.ToastType = void 0;
var utils_1 = require("@eventuras/utils");
var __1 = require("../..");
var ToastType;
(function (ToastType) {
    ToastType["SUCCESS"] = "success";
    ToastType["ERROR"] = "error";
    ToastType["INFO"] = "info";
})(ToastType || (exports.ToastType = ToastType = {}));
var getToastClassName = function (type) {
    var colorClass = '';
    switch (type) {
        case ToastType.SUCCESS:
            colorClass = 'bg-green-500 text-white';
            break;
        case ToastType.ERROR:
            colorClass = 'bg-red-500 text-white';
            break;
        default:
            colorClass = 'bg-blue-500 text-white';
    }
    return "m-2 p-4 rounded-xs shadow-lg ".concat(colorClass);
};
var Toast = function (_a) {
    var _b = _a.toasts, toasts = _b === void 0 ? [] : _b;
    return (<div>
      <__1.Portal isOpen={toasts.length > 0}>
        <div className="fixed bottom-0 right-0 z-50 p-4">
        {toasts
            .filter(function (toast) { return toast != null; })
            .map(function (_a) {
            var _b;
            var id = _a.id, message = _a.message, _c = _a.type, type = _c === void 0 ? ToastType.INFO : _c;
            return (<div key={id} {..._b = {}, _b[utils_1.DATA_TEST_ID] = (type === ToastType.SUCCESS ? 'toast-success' : 'toast-error'), _b} className={getToastClassName(type)}>
              {message}
            </div>);
        })}
        </div>
      </__1.Portal>
    </div>);
};
exports.Toast = Toast;
