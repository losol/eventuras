"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var icons_1 = require("../icons");
var Button_1 = require("../Button/Button");
var Text_1 = require("../Text/Text");
var Pagination = function (_a) {
    var onPreviousPageClick = _a.onPreviousPageClick, onNextPageClick = _a.onNextPageClick, currentPage = _a.currentPage, totalPages = _a.totalPages;
    return (<div className="flex justify-center items-center py-5">
      <Button_1.default aria-label="Previous Page" onClick={onPreviousPageClick} disabled={currentPage <= 1}>
        <icons_1.ChevronsLeft />
      </Button_1.default>
      <Text_1.default>
        Page <Text_1.default as="span">{currentPage}</Text_1.default> of <Text_1.default as="span">{totalPages}</Text_1.default>
      </Text_1.default>
      <Button_1.default aria-label="Next Page" onClick={onNextPageClick} disabled={currentPage >= totalPages}>
        <icons_1.ChevronsRight />
      </Button_1.default>
    </div>);
};
exports.default = Pagination;
