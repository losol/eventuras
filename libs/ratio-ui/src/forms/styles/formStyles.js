"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formStyles = exports.componentStyles = exports.layoutStyles = exports.interactionStyles = exports.textStyles = void 0;
// Text styles for various UI elements
exports.textStyles = {
    inputPlaceholder: 'text-gray-600 dark:text-gray-300',
    comboBoxInput: 'text-gray-900 dark:text-gray-100',
    // Dropdown button
    dropdownButton: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
    // ListBox item text variants
    listBoxItemPrimary: '', // for country codes
    listBoxItemSecondary: '',
    // Error and validation text
    errorText: 'text-red-500 dark:text-red-400 text-sm mt-1',
    validationText: 'text-green-500 dark:text-green-400 text-sm mt-1',
    // Helper text
    helperText: 'text-gray-600 dark:text-gray-400 text-xs mt-1',
    // Empty state text
    emptyStateText: 'text-gray-500 dark:text-gray-400 italic',
    // Focus and interaction states
    focusedText: 'text-blue-600 dark:text-blue-400',
    selectedText: 'text-white',
    disabledText: 'text-gray-400 dark:text-gray-600',
};
// Interactive element styles
exports.interactionStyles = {
    // Hover states
    listBoxItemHover: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    buttonHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
    // Focus states
    listBoxItemFocused: 'data-[focused]:bg-blue-100 dark:data-[focused]:bg-blue-700',
    inputFocused: 'focus-within:ring-2 focus-within:ring-blue-400',
    // Selected states
    listBoxItemSelected: 'data-[selected]:bg-blue-500 data-[selected]:text-white',
    // Disabled states
    disabled: 'opacity-50 cursor-not-allowed',
    // Transitions
    transition: 'transition duration-150 ease-in-out',
};
// Layout and spacing styles
exports.layoutStyles = {
    // Flexbox layouts
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
    flexStart: 'flex items-center',
    flexColumn: 'flex flex-col',
    // Gaps and spacing
    gapSm: 'gap-1',
    gapMd: 'gap-2',
    gapLg: 'gap-4',
    // Padding variants
    paddingSm: 'px-2 py-1',
    paddingMd: 'px-3 py-2',
    paddingLg: 'px-4 py-3',
    // Width and sizing
    widthFull: 'w-full',
    widthAuto: 'w-auto',
    flexShrink: 'flex-shrink-0',
    flexGrow: 'flex-1',
    // Positioning
    relative: 'relative',
    absolute: 'absolute',
    zIndex: 'z-50',
};
// Component-specific style combinations
exports.componentStyles = {
    // ComboBox container
    integratedComboBoxContainer: "w-32 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 ".concat(exports.layoutStyles.flexShrink),
    // ComboBox input wrapper
    comboBoxInputWrapper: "".concat(exports.layoutStyles.flexStart),
    // ComboBox input field
    comboBoxInputField: "".concat(exports.layoutStyles.widthFull, " text-center px-2 py-2 bg-transparent ").concat(exports.textStyles.comboBoxInput),
    // Popover/dropdown
    popover: "w-40 max-h-56 overflow-y-auto border rounded bg-white dark:bg-gray-900 shadow-lg ".concat(exports.layoutStyles.zIndex),
    // List box item
    listBoxItem: "px-3 py-2 ".concat(exports.layoutStyles.flexStart, " ").concat(exports.layoutStyles.gapMd, " cursor-pointer ").concat(exports.interactionStyles.listBoxItemHover, " ").concat(exports.interactionStyles.listBoxItemFocused, " ").concat(exports.interactionStyles.listBoxItemSelected),
    // Phone input container
    phoneInputContainer: "bg-gray-100 flex items-stretch ".concat(exports.layoutStyles.flexStart, " ").concat(exports.layoutStyles.widthFull, " overflow-hidden border-2 dark:border-gray-700 ").concat(exports.interactionStyles.inputFocused, " ").concat(exports.interactionStyles.transition),
};
// Updated formStyles with extracted text styles
exports.formStyles = {
    defaultInputStyle: "\n        appearance-none\n        ".concat(exports.layoutStyles.widthFull, "\n        ").concat(exports.textStyles.comboBoxInput, "\n        p-4\n        bg-gray-100\n        dark:bg-gray-800\n        border-2\n        dark:border-gray-700\n        leading-tight\n        focus:outline-hidden\n        focus:shadow-outline"),
    lightInputStyle: "\n        appearance-none\n        ".concat(exports.layoutStyles.widthFull, "\n        p-4\n        bg-white\n        text-black\n        border-2\n        dark:border-gray-400\n        focus:outline-hidden\n        focus:shadow-outline"),
    inputDescription: "".concat(exports.textStyles.comboBoxInput, " text-sm mb-2"),
    inputErrorGlow: 'border border-red-500 shadow-outline-red',
    inputWrapper: 'mb-3',
    textarea: 'resize-y',
};
