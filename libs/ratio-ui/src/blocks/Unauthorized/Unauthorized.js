"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unauthorized = Unauthorized;
var icons_1 = require("../icons");
function Unauthorized(_a) {
    var _b = _a.homeUrl, homeUrl = _b === void 0 ? '/' : _b, _c = _a.variant, variant = _c === void 0 ? 'large' : _c;
    var isSmall = variant === 'small';
    return (<div className={"text-center ".concat(isSmall ? 'py-8' : 'py-20', " bg-red-500 text-white")}>
      <div className="inline-flex items-center justify-center p-2">
        <icons_1.ShieldX className={"".concat(isSmall ? 'h-6 w-6' : 'h-8 w-8', " animate-bounce")} strokeWidth={2}/>
        <h1 className={"".concat(isSmall ? 'text-2xl' : 'text-4xl', " font-extrabold ml-2")}>Unauthorized</h1>
      </div>
      <p className={"".concat(isSmall ? 'text-md' : 'text-lg', " mt-2")}>
        Uh-oh! It looks like you do not have the right permissions to view this content.
      </p>
      {!isSmall && (<p className="text-md my-6">If you believe this is an error, please contact support.</p>)}
    </div>);
}
