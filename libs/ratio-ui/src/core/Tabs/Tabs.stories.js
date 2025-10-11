"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateTitlesWithIds = exports.RichPanels = exports.DynamicFromData = exports.ManyTabsOverflow = exports.Basic = void 0;
var react_1 = require("react");
var Tabs_1 = require("../Tabs");
var meta = {
    title: 'Core/Tabs',
    component: Tabs_1.Tabs,
    parameters: {
        layout: 'centered',
        controls: { hideNoControlsWarning: true },
        docs: {
            description: {
                component: 'Accessible tabs built on react-aria-components. Provide one or more `<Tabs.Item title="…">…</Tabs.Item>` children.',
            },
        },
    },
};
exports.default = meta;
/** 1) Basic usage */
exports.Basic = {
    args: {
        children: (<>
        <Tabs_1.Tabs.Item id="overview" title="Overview">
            <p className="mb-2 font-semibold">Overview</p>
            <p>Keep general information here.</p>
        </Tabs_1.Tabs.Item>

        <Tabs_1.Tabs.Item id="details" title="Details">
          <p className="mb-2 font-semibold">Details</p>
          <ul className="list-disc pl-5">
              <li>Specification A</li>
              <li>Specification B</li>
            </ul>
        </Tabs_1.Tabs.Item>

        <Tabs_1.Tabs.Item id="activity" title="Activity">
          <p className="mb-2 font-semibold">Activity</p>
          <p>Recent events and logs.</p>
        </Tabs_1.Tabs.Item>
      </>),
    },
    render: function (args) { return (<div className="w-[720px] max-w-full">
      <Tabs_1.Tabs {...args}/>
    </div>); },
};
/** 2) Many tabs to demonstrate horizontal scroll/overflow */
exports.ManyTabsOverflow = {
    args: {
        children: Array.from({ length: 12 }).map(function (_, idx) { return (<Tabs_1.Tabs.Item key={idx} id={"t-".concat(idx + 1)} title={"Section ".concat(idx + 1)}>
          <p className="mb-2 font-semibold">Section {idx + 1}</p>
          <p>
            This tab bar is scrollable (uses <code>overflow-x-auto</code> on the list).
          </p>
      </Tabs_1.Tabs.Item>); }),
    },
    render: function (args) { return (<div className="w-[720px] max-w-full">
      <Tabs_1.Tabs {...args}/>
    </div>); },
};
/** 3) Dynamic tabs from data */
exports.DynamicFromData = {
    args: {
        children: (function () {
            // In a real app this could be fetched/config-driven
            var sections = [
                { id: 'intro', label: 'Intro', content: 'Welcome to the feature.' },
                { id: 'setup', label: 'Setup', content: 'Installation and configuration.' },
                { id: 'api', label: 'API', content: 'Endpoints and usage.' },
            ];
            return sections.map(function (s) { return (<Tabs_1.Tabs.Item key={s.id} id={s.id} title={s.label}>
          <p className="mb-2 font-semibold">{s.label}</p>
          <p>{s.content}</p>
        </Tabs_1.Tabs.Item>); });
        })(),
    },
    render: function (args) { return (<div className="w-[720px] max-w-full">
      <Tabs_1.Tabs {...args}/>
    </div>); },
};
/** 4) Rich content inside panels (forms, lists, actions) */
exports.RichPanels = {
    args: {
        children: (<>
        <Tabs_1.Tabs.Item id="profile" title="Profile">
            <form onSubmit={function (e) {
                e.preventDefault();
                alert('Saved!');
            }} className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm">Display name</span>
                <input className="rounded border px-3 py-2" placeholder="Ada Lovelace"/>
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Email</span>
                <input className="rounded border px-3 py-2" placeholder="ada@example.com"/>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="rounded bg-black px-3 py-2 text-white">
                  Save
                </button>
                <button type="button" className="rounded border px-3 py-2">
                  Cancel
                </button>
              </div>
            </form>
        </Tabs_1.Tabs.Item>

        <Tabs_1.Tabs.Item id="teams" title="Teams">
            <ul className="divide-y rounded border">
              {['Core', 'Platform', 'Design'].map(function (team) { return (<li key={team} className="flex items-center justify-between px-3 py-2">
                  <span>{team}</span>
                  <button className="rounded border px-2 py-1 text-sm">Manage</button>
                </li>); })}
            </ul>
        </Tabs_1.Tabs.Item>

        <Tabs_1.Tabs.Item id="billing" title="Billing">
            <p className="mb-3">Current plan: <strong>Pro</strong></p>
            <button className="rounded bg-black px-3 py-2 text-white">Upgrade</button>
        </Tabs_1.Tabs.Item>
      </>),
    },
    render: function (args) { return (<div className="w-[720px] max-w-full">
      <Tabs_1.Tabs {...args}/>
    </div>); },
};
/** 5) Duplicate titles but unique IDs (recommended for i18n or similar labels) */
exports.DuplicateTitlesWithIds = {
    args: {
        children: (<>
        {/* Titles can collide; use explicit IDs to keep keys/states stable */}
        <Tabs_1.Tabs.Item id="users-active" title="Users">
            <p className="mb-2 font-semibold">Users (Active)</p>
            <p>List of active users.</p>
        </Tabs_1.Tabs.Item>
        <Tabs_1.Tabs.Item id="users-archived" title="Users">
            <p className="mb-2 font-semibold">Users (Archived)</p>
            <p>List of archived users.</p>
        </Tabs_1.Tabs.Item>
      </>),
    },
    render: function (args) { return (<div className="w-[720px] max-w-full">
      <Tabs_1.Tabs {...args}/>
    </div>); },
};
