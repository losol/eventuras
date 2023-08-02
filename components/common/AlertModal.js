"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("@chakra-ui/react");
var AlertModal = function (_a) {
    var _b = _a.isOpen, isOpen = _b === void 0 ? false : _b, onClose = _a.onClose, _c = _a.title, title = _c === void 0 ? '' : _c, _d = _a.text, text = _d === void 0 ? '' : _d;
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)(react_1.Modal, { blockScrollOnMount: false, isOpen: isOpen, onClose: onClose, children: [(0, jsx_runtime_1.jsx)(react_1.ModalOverlay, {}), (0, jsx_runtime_1.jsxs)(react_1.ModalContent, { children: [(0, jsx_runtime_1.jsx)(react_1.ModalHeader, { children: title }), (0, jsx_runtime_1.jsx)(react_1.ModalCloseButton, {}), (0, jsx_runtime_1.jsx)(react_1.ModalBody, { children: (0, jsx_runtime_1.jsx)(react_1.Text, { fontWeight: "bold", mb: "1rem", children: text }) }), (0, jsx_runtime_1.jsx)(react_1.ModalFooter, { children: (0, jsx_runtime_1.jsx)(react_1.Button, { colorScheme: "blue", onClick: onClose, children: "Close" }) })] })] }) }));
};
exports.default = AlertModal;
