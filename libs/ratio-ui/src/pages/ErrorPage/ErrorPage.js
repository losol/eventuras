"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorPage = void 0;
var react_1 = require("react");
var clsx_1 = require("clsx");
var icons_1 = require("../icons");
/** Map tone → panel styles */
var toneCls = {
    fatal: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
    success: 'bg-green-100 border-green-500 text-green-800',
};
/** Minimal icon per tone */
function ToneIcon(_a) {
    var tone = _a.tone;
    var iconProps = { className: "h-7 w-7 mr-2", strokeWidth: 2 };
    switch (tone) {
        case 'fatal':
            return <icons_1.AlertCircle {...iconProps}/>;
        case 'warning':
            return <icons_1.AlertTriangle {...iconProps}/>;
        case 'info':
            return <icons_1.Info {...iconProps}/>;
        case 'success':
            return <icons_1.Check {...iconProps}/>;
    }
}
/** See: {@link ErrorPageProps} */
function Root(_a) {
    var _b = _a.tone, tone = _b === void 0 ? 'fatal' : _b, _c = _a.fullScreen, fullScreen = _c === void 0 ? true : _c, className = _a.className, children = _a.children;
    // ➜ Choose container sizing
    var container = fullScreen ? 'fixed inset-0' : 'relative';
    // ➜ Root wrapper
    var root = (0, clsx_1.default)(container, 'bg-black/90 flex p-10');
    // ➜ Panel with tone style
    var panel = (0, clsx_1.default)('w-full border-l-4 p-6 self-center', toneCls[tone], className);
    return (<div className={root}>
      <div className={panel} role="alert" aria-live="assertive">
        <div className="flex items-start">
          <ToneIcon tone={tone}/>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>);
}
/** Title slot */
function Title(_a) {
    var children = _a.children;
    return <h1 className="text-2xl font-bold">{children}</h1>;
}
/** Description slot */
function Description(_a) {
    var children = _a.children;
    return <p className="mt-2">{children}</p>;
}
/** Extra content slot */
function Extra(_a) {
    var children = _a.children;
    return <div className="mt-4">{children}</div>;
}
/** Action slot */
function Action(_a) {
    var children = _a.children;
    return <div className="mt-6">{children}</div>;
}
/** Export compound API */
exports.ErrorPage = Object.assign(Root, {
    Title: Title,
    Description: Description,
    Extra: Extra,
    Action: Action,
});
