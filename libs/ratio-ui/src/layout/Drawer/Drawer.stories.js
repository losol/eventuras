"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawerWithSaveAndCancel = exports.ClosedDrawer = exports.OpenDrawer = void 0;
var react_1 = require("react");
var Drawer_1 = require("./Drawer");
var getRandomHipsterIpsum = function () {
    var hipsterIpsums = [
        'Pabst semiotics distillery bicycle rights forage. Art party crucifix poutine vinyl.',
        'Vexillologist ramps chambray meditation. Ethical air plant keytar brooklyn.',
        'Chia mumblecore hoodie umami fanny pack quinoa sriracha. Gastropub truffaut etsy succulents.',
        'Bespoke kinfolk food truck yuccie seitan. Tofu taxidermy quinoa microdosing prism.',
    ];
    var randomIndex = Math.floor(Math.random() * hipsterIpsums.length);
    return hipsterIpsums[randomIndex];
};
var meta = {
    component: Drawer_1.default,
    parameters: {
        tags: ['autodocs'],
    },
};
exports.default = meta;
var OpenDrawerComponent = function () {
    var _a = (0, react_1.useState)(true), isOpen = _a[0], setIsOpen = _a[1];
    return (<div>
      <p>{getRandomHipsterIpsum()}</p>
      <Drawer_1.default isOpen={isOpen} onSave={function () { return setIsOpen(false); }} onCancel={function () { return setIsOpen(false); }}>
        <Drawer_1.default.Header>Drawer Header</Drawer_1.default.Header>
        <Drawer_1.default.Body>
          <p>{getRandomHipsterIpsum()}</p>
        </Drawer_1.default.Body>
        <Drawer_1.default.Footer>Drawer Footer</Drawer_1.default.Footer>
      </Drawer_1.default>
    </div>);
};
var OpenDrawer = function () { return <OpenDrawerComponent />; };
exports.OpenDrawer = OpenDrawer;
var ClosedDrawerComponent = function () {
    var _a = (0, react_1.useState)(false), isOpen = _a[0], setIsOpen = _a[1];
    return (<div>
      <p>This is some content before the drawer.</p>
      <button onClick={function () { return setIsOpen(true); }}>Open Drawer</button>
      <Drawer_1.default isOpen={isOpen} onSave={function () { return setIsOpen(false); }} onCancel={function () { return setIsOpen(false); }}>
        <Drawer_1.default.Header>Drawer Header sample</Drawer_1.default.Header>
        <Drawer_1.default.Body>
          <p>{getRandomHipsterIpsum()}</p>
        </Drawer_1.default.Body>
        <Drawer_1.default.Footer>Drawer Footer</Drawer_1.default.Footer>
      </Drawer_1.default>
    </div>);
};
var ClosedDrawer = function () { return <ClosedDrawerComponent />; };
exports.ClosedDrawer = ClosedDrawer;
var DrawerWithActionsComponent = function () {
    var _a = (0, react_1.useState)(true), isOpen = _a[0], setIsOpen = _a[1];
    var handleSave = function () {
        alert('Save action triggered!');
        setIsOpen(false);
    };
    var handleCancel = function () {
        alert('Cancel action triggered!');
        setIsOpen(false);
    };
    return (<div>
      <button onClick={function () { return setIsOpen(true); }}>Open Drawer</button>
      <Drawer_1.default isOpen={isOpen} onSave={handleSave} onCancel={handleCancel}>
        <Drawer_1.default.Header>Drawer With Save and Cancel</Drawer_1.default.Header>
        <Drawer_1.default.Body>
          <p>{getRandomHipsterIpsum()}</p>
        </Drawer_1.default.Body>
      </Drawer_1.default>
    </div>);
};
var DrawerWithSaveAndCancel = function () { return <DrawerWithActionsComponent />; };
exports.DrawerWithSaveAndCancel = DrawerWithSaveAndCancel;
