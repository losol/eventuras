/**
 * Defines the types of input elements supported, based on standard HTML input types.
 * This type restriction helps in ensuring that only valid HTML input types can be used.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types For more information on HTML input types.
 */
export type ValidInputTypes =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

/**
 * Generic interface for primitive input component properties.
 * This represents the base properties for input elements without composite features like labels.
 *
 * @property {string} [id] - Optional. Unique identifier for the input element.
 * @property {string} name - Required. Name of the input element, used for form submission.
 * @property {ValidInputTypes} [type='text'] - Optional. Specifies the type of input. Defaults to 'text'.
 * @property {string} [placeholder] - Optional. Hint to the user about what to enter in the input.
 * @property {string} [className] - Optional. Additional CSS classes for styling the input element.
 * @property {string} [testId] - Optional. Attribute for identifying elements in tests.
 * @property {boolean} [disabled] - Optional. Whether the input is disabled.
 * @property {boolean} [required] - Optional. Whether the input is required.
 * @property {[x: string]: any} - Optional. Allows for any other properties not explicitly defined, ensuring flexibility.
 */
export interface InputProps {
  id?: string;
  name: string;
  type?: ValidInputTypes;
  placeholder?: string;
  className?: string;
  testId?: string;
  disabled?: boolean;
  required?: boolean;
  [x: string]: any;
}

/**
 * Props for composite input field components (TextField, NumberField, Select, etc).
 * Extends InputProps with label, description, and error handling for complete form fields.
 *
 * @property {string} [label] - Optional. Text label associated with the input element.
 * @property {string} [description] - Optional. Description of the input element, providing additional context.
 * @property {{ [key: string]: { message: string } }} [errors] - Optional. Object containing error messages, keyed by input names.
 * @property {boolean} [multiline] - Optional. Whether to render as textarea instead of input.
 * @property {number} [rows] - Optional. Number of rows for textarea.
 * @property {number} [cols] - Optional. Number of columns for textarea.
 * @property {boolean} [noMargin] - Optional. Remove default margin.
 * @property {boolean} [noWrapper] - Optional. Remove wrapper div.
 */
export interface InputFieldProps extends InputProps {
  label?: string;
  description?: string;
  errors?: { [key: string]: { message: string } };
  noMargin?: boolean;
  noWrapper?: boolean;
}
