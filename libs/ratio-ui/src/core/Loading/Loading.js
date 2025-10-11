"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var icons_1 = require("../icons");
// Source: https://flowbite.com/docs/@/components/spinner/
var Loading = function () {
    return (<div role="status">
      <icons_1.LoaderCircle className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600"/>
      <span className="sr-only">Loading...</span>
    </div>);
};
exports.default = Loading;
