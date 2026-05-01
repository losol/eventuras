// Text styles for various UI elements
export const textStyles = {
  comboBoxInput: 'text-(--text)',

  // Dropdown button
  dropdownButton: 'text-(--text-subtle) hover:text-(--text)',

  // ListBox item text variants
  listBoxItemPrimary: '', // for country codes
  listBoxItemSecondary: '',

  // Error and validation text
  errorText: 'text-error-text text-sm mt-1',
  validationText: 'text-success-text text-sm mt-1',

  // Helper text
  helperText: 'text-(--text-muted) text-xs mt-1',

  // Empty state text
  emptyStateText: 'text-(--text-subtle) italic',

  // Focus and interaction states
  focusedText: 'text-(--primary)',
  selectedText: 'text-(--text-on-primary)',
  disabledText: 'text-(--text-subtle)',
};

// Interactive element styles
export const interactionStyles = {
  // Hover states
  listBoxItemHover: 'hover:bg-card-hover',
  buttonHover: 'hover:bg-card-hover',

  // Focus states
  listBoxItemFocused: 'data-[focused]:bg-primary-100 dark:data-[focused]:bg-primary-900',
  inputFocused: 'focus-within:ring-2 focus-within:ring-(--focus-ring)',

  // Selected states
  listBoxItemSelected: 'data-[selected]:bg-(--primary) data-[selected]:text-(--text-on-primary)',

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
  integratedComboBoxContainer: `w-32 border-border-1 bg-card ${layoutStyles.flexShrink}`,

  // ComboBox input wrapper
  comboBoxInputWrapper: `${layoutStyles.flexStart}`,

  // ComboBox input field
  comboBoxInputField: `${layoutStyles.widthFull} text-center px-2 py-2 bg-transparent ${textStyles.comboBoxInput}`,

  // Popover/dropdown
  popover: `w-40 max-h-56 overflow-y-auto border border-border-1 rounded-lg bg-card shadow-lg ${layoutStyles.zIndex}`,

  // List box item
  listBoxItem: `px-3 py-2 ${layoutStyles.flexStart} ${layoutStyles.gapMd} cursor-pointer ${interactionStyles.listBoxItemHover} ${interactionStyles.listBoxItemFocused} ${interactionStyles.listBoxItemSelected}`,

  // Phone input container
  phoneInputContainer: `bg-card flex items-stretch ${layoutStyles.flexStart} ${layoutStyles.widthFull} overflow-hidden border-2 border-border-1 ${interactionStyles.inputFocused} ${interactionStyles.transition}`,
};

// Updated formStyles with extracted text styles
export const formStyles = {
  defaultInputStyle: `
        appearance-none
        ${layoutStyles.widthFull}
        ${textStyles.comboBoxInput}
        p-4
        rounded-lg
        bg-card
        border-2
        border-border-1
        leading-tight
        focus:outline-hidden
        focus:ring-2
        focus:ring-(--focus-ring)`,
  lightInputStyle: `
        appearance-none
        ${layoutStyles.widthFull}
        p-4
        rounded-lg
        bg-card
        text-(--text)
        border-2
        border-border-2
        focus:outline-hidden
        focus:ring-2
        focus:ring-(--focus-ring)`,
  inputDescription: `${textStyles.comboBoxInput} text-sm mb-2`,
  inputErrorGlow: 'border border-error-border ring-2 ring-error-border',
  inputWrapper: 'mb-3',
  textarea: 'resize-y',
};
