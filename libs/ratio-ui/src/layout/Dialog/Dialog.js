"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dialog = void 0;
var Heading_1 = require("../../core/Heading");
var utils_1 = require("@eventuras/utils");
var overlays_1 = require("@react-aria/overlays");
var react_1 = require("react");
var react_aria_components_1 = require("react-aria-components");
var Dialog = function (props) {
    var _a;
    return (<DialogModal isOpen={props.isOpen} {..._a = {}, _a[utils_1.DATA_TEST_ID] = props[utils_1.DATA_TEST_ID], _a} onClickOutside={props.onClose}>
      <react_aria_components_1.Dialog className="relative z-10">
        <Heading_1.Heading as="h3" padding="pt-0 pb-3">
          {props.title}
        </Heading_1.Heading>
        {props.children}
      </react_aria_components_1.Dialog>
    </DialogModal>);
};
exports.Dialog = Dialog;
function DialogModal(props) {
    var _a;
    if (!props.isOpen) {
        return null;
    }
    return (<overlays_1.Overlay>
      <div {..._a = {}, _a[utils_1.DATA_TEST_ID] = props[utils_1.DATA_TEST_ID], _a} className="flex min-h-full min-w-full items-start justify-center p-4 text-center fixed inset-0 z-100 overflow-auto h-full bg-black/50" id="underlay" role="button" style={{
            zIndex: 100,
        }} onClick={function (e) {
            var t = e.target;
            if (t['id'] === 'underlay') {
                if (props.onClickOutside)
                    props.onClickOutside();
            }
        }} onKeyDown={function (e) {
            if (e.key === 'Escape') {
                if (props.onClickOutside)
                    props.onClickOutside();
            }
        }}>
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-700 dark:text-white p-6 text-left align-middle shadow-xl transition-all">
          {props.children}
        </div>
      </div>
    </overlays_1.Overlay>);
}
