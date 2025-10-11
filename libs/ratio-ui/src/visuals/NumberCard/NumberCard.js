"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NumberCard = function (_a) {
    var number = _a.number, label = _a.label;
    return (<div className="flex flex-col items-center justify-center p-2 bg-white rounded-md shadow-md dark:bg-black">
      <span className="text-3xl font-bold text-gray-800 dark:text-white">{number !== null && number !== void 0 ? number : '?'}</span>
      <span className="text-sm font-semibold text-gray-400 dark:text-gray-300">{label}</span>
    </div>);
};
exports.default = NumberCard;
