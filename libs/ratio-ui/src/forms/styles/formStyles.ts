// Text styles for various UI elements
export const textStyles = {
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
export const interactionStyles = {
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
export const layoutStyles = {
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
export const componentStyles = {
  // ComboBox container
  integratedComboBoxContainer: `w-32 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 ${layoutStyles.flexShrink}`,

  // ComboBox input wrapper
  comboBoxInputWrapper: `${layoutStyles.flexStart}`,

  // ComboBox input field
  comboBoxInputField: `${layoutStyles.widthFull} text-center px-2 py-2 bg-transparent ${textStyles.comboBoxInput}`,

  // Popover/dropdown
  popover: `w-40 max-h-56 overflow-y-auto border rounded bg-white dark:bg-gray-900 shadow-lg ${layoutStyles.zIndex}`,

  // List box item
  listBoxItem: `px-3 py-2 ${layoutStyles.flexStart} ${layoutStyles.gapMd} cursor-pointer ${interactionStyles.listBoxItemHover} ${interactionStyles.listBoxItemFocused} ${interactionStyles.listBoxItemSelected}`,

  // Phone input container
  phoneInputContainer: `bg-gray-100 flex items-stretch ${layoutStyles.flexStart} ${layoutStyles.widthFull} overflow-hidden border-2 dark:border-gray-700 ${interactionStyles.inputFocused} ${interactionStyles.transition}`,
};

// Updated formStyles with extracted text styles
export const formStyles = {
  defaultInputStyle: `
        appearance-none
        ${layoutStyles.widthFull}
        ${textStyles.comboBoxInput}
        p-4
        bg-gray-100
        dark:bg-gray-800
        border-2
        dark:border-gray-700
        leading-tight
        focus:outline-hidden
        focus:shadow-outline`,
  lightInputStyle: `
        appearance-none
        ${layoutStyles.widthFull}
        p-4
        bg-white
        text-black
        border-2
        dark:border-gray-400
        focus:outline-hidden
        focus:shadow-outline`,
  inputDescription: `${textStyles.comboBoxInput} text-sm mb-2`,
  inputErrorGlow: 'border border-red-500 shadow-outline-red',
  inputWrapper: 'mb-3',
  textarea: 'resize-y',
};
