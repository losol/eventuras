"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Term = exports.Item = exports.DescriptionList = exports.Definition = void 0;
var react_1 = require("react");
var utils_1 = require("@eventuras/utils");
var styles = {
    descriptionList: 'divide-y divide-gray-100 dark:divide-gray-800',
    item: 'px-2 py-2 grid grid-cols-2 md:grid-cols-4',
    term: 'text-sm font-medium leading-6 break-words md:col-span-1',
    definition: 'mt-1 text-sm leading-6 break-words md:col-span-3',
};
var DescriptionList = function (_a) {
    var children = _a.children;
    return <dl className={styles.descriptionList}>{children}</dl>;
};
exports.DescriptionList = DescriptionList;
var Item = function (_a) {
    var children = _a.children;
    return <div className={styles.item}>{children}</div>;
};
exports.Item = Item;
var Term = function (_a) {
    var children = _a.children;
    return <dt className={styles.term}>{children}</dt>;
};
exports.Term = Term;
var Definition = function (props) {
    var _a;
    return (<dd className={styles.definition} {..._a = {}, _a[utils_1.DATA_TEST_ID] = props[utils_1.DATA_TEST_ID], _a}>
      {props.children}
    </dd>);
};
exports.Definition = Definition;
