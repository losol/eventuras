"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullScreen = exports.Gallery = exports.Success = exports.Info = exports.Warning = exports.Fatal = exports.Playground = void 0;
var ErrorPage_1 = require("./ErrorPage");
/** See: {@link ErrorPageProps} */
var meta = {
    // ➜ Sidebar group
    title: 'Blocks/ErrorPage',
    // ➜ Component
    component: ErrorPage_1.ErrorPage,
    // ➜ Controls
    argTypes: {
        tone: { control: 'inline-radio', options: ['fatal', 'warning', 'info', 'success'] },
        fullScreen: { control: 'boolean' },
        className: { control: 'text' },
    },
    // ➜ Safe default for Storybook canvas
    args: { tone: 'fatal', fullScreen: false },
};
exports.default = meta;
/** ➜ Interactive playground */
exports.Playground = {
    render: function (args) { return (<ErrorPage_1.ErrorPage {...args}>
      {/* Title */}
      <ErrorPage_1.ErrorPage.Title>Something went wrong</ErrorPage_1.ErrorPage.Title>
      {/* Description */}
      <ErrorPage_1.ErrorPage.Description>We couldn’t complete your request.</ErrorPage_1.ErrorPage.Description>
      {/* Extra */}
      <ErrorPage_1.ErrorPage.Extra>If this persists, contact support with the error details.</ErrorPage_1.ErrorPage.Extra>
      {/* Action */}
      <ErrorPage_1.ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Go Home</button>
      </ErrorPage_1.ErrorPage.Action>
    </ErrorPage_1.ErrorPage>); },
};
/** ➜ Fatal tone */
exports.Fatal = {
    render: function () { return (<ErrorPage_1.ErrorPage tone="fatal">
      <ErrorPage_1.ErrorPage.Title>Critical failure</ErrorPage_1.ErrorPage.Title>
      <ErrorPage_1.ErrorPage.Description>An unexpected system error occurred.</ErrorPage_1.ErrorPage.Description>
      <ErrorPage_1.ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Reload</button>
      </ErrorPage_1.ErrorPage.Action>
    </ErrorPage_1.ErrorPage>); },
};
/** ➜ Warning tone */
exports.Warning = {
    render: function () { return (<ErrorPage_1.ErrorPage tone="warning">
      <ErrorPage_1.ErrorPage.Title>Heads up</ErrorPage_1.ErrorPage.Title>
      <ErrorPage_1.ErrorPage.Description>Some features may not work as expected.</ErrorPage_1.ErrorPage.Description>
      <ErrorPage_1.ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Retry</button>
      </ErrorPage_1.ErrorPage.Action>
    </ErrorPage_1.ErrorPage>); },
};
/** ➜ Info tone */
exports.Info = {
    render: function () { return (<ErrorPage_1.ErrorPage tone="info">
      <ErrorPage_1.ErrorPage.Title>Maintenance mode</ErrorPage_1.ErrorPage.Title>
      <ErrorPage_1.ErrorPage.Description>We’re performing scheduled updates.</ErrorPage_1.ErrorPage.Description>
      <ErrorPage_1.ErrorPage.Extra>Estimated time: ~15 minutes.</ErrorPage_1.ErrorPage.Extra>
    </ErrorPage_1.ErrorPage>); },
};
/** ➜ Success tone (e.g., recovery state) */
exports.Success = {
    render: function () { return (<ErrorPage_1.ErrorPage tone="success">
      <ErrorPage_1.ErrorPage.Title>Recovered</ErrorPage_1.ErrorPage.Title>
      <ErrorPage_1.ErrorPage.Description>The system is back online.</ErrorPage_1.ErrorPage.Description>
      <ErrorPage_1.ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Continue</button>
      </ErrorPage_1.ErrorPage.Action>
    </ErrorPage_1.ErrorPage>); },
};
/** ➜ Side-by-side gallery for quick visual QA */
exports.Gallery = {
    render: function () { return (<div className="grid gap-6">
      {/* Fatal */}
      <ErrorPage_1.ErrorPage tone="fatal" fullScreen={false}>
        <ErrorPage_1.ErrorPage.Title>Critical failure</ErrorPage_1.ErrorPage.Title>
        <ErrorPage_1.ErrorPage.Description>Unexpected error.</ErrorPage_1.ErrorPage.Description>
      </ErrorPage_1.ErrorPage>
      {/* Warning */}
      <ErrorPage_1.ErrorPage tone="warning" fullScreen={false}>
        <ErrorPage_1.ErrorPage.Title>Degraded performance</ErrorPage_1.ErrorPage.Title>
        <ErrorPage_1.ErrorPage.Description>Some features limited.</ErrorPage_1.ErrorPage.Description>
      </ErrorPage_1.ErrorPage>
      {/* Info */}
      <ErrorPage_1.ErrorPage tone="info" fullScreen={false}>
        <ErrorPage_1.ErrorPage.Title>Maintenance</ErrorPage_1.ErrorPage.Title>
        <ErrorPage_1.ErrorPage.Description>Back soon.</ErrorPage_1.ErrorPage.Description>
      </ErrorPage_1.ErrorPage>
      {/* Success */}
      <ErrorPage_1.ErrorPage tone="success" fullScreen={false}>
        <ErrorPage_1.ErrorPage.Title>Recovered</ErrorPage_1.ErrorPage.Title>
        <ErrorPage_1.ErrorPage.Description>All good now.</ErrorPage_1.ErrorPage.Description>
      </ErrorPage_1.ErrorPage>
    </div>); },
};
/** ➜ Fullscreen demo (may cover canvas) */
exports.FullScreen = {
    render: function () { return (<ErrorPage_1.ErrorPage tone="fatal" fullScreen>
      <ErrorPage_1.ErrorPage.Title>Critical failure</ErrorPage_1.ErrorPage.Title>
      <ErrorPage_1.ErrorPage.Description>Please reload the page.</ErrorPage_1.ErrorPage.Description>
      <ErrorPage_1.ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Reload</button>
      </ErrorPage_1.ErrorPage.Action>
    </ErrorPage_1.ErrorPage>); },
};
