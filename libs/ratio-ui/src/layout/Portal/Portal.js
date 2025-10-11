"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_dom_1 = require("react-dom");
var Portal = function (_a) {
    var isOpen = _a.isOpen, children = _a.children, target = _a.target, clickOutside = _a.clickOutside;
    if (!isOpen)
        return null;
    var portalRoot = target ? document.getElementById(target) : document.body;
    if (!portalRoot)
        return null;
    if (clickOutside) {
        portalRoot.addEventListener('mousedown', function (event) {
            if (event.target.id === 'backdrop') {
                clickOutside();
            }
        });
    }
    return react_dom_1.default.createPortal(children, portalRoot);
};
exports.default = Portal;
