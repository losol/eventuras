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
 * Generic interface for input component properties. This interface standardizes the expected properties
 * for input components across the application, ensuring consistency and facilitating ease of use.
 *
 * @property {string} [id] - Optional. Unique identifier for the input element.
 * @property {string} name - Required. Name of the input element, used for form submission and linking with labels.
 * @property {ValidInputTypes} [type='text'] - Optional. Specifies the type of input. Defaults to 'text'.
 * @property {string} [placeholder] - Optional. Hint to the user about what to enter in the input.
 * @property {string} [label] - Optional. Text label associated with the input element.
 * @property {string} [description] - Optional. Description of the input element, providing additional context.
 * @property {string} [className] - Optional. Additional CSS classes for styling the input element.
 * @property {{ [key: string]: { message: string } }} [errors] - Optional. Object containing error messages, keyed by input names.
 * @property {string} [dataTestId] - Optional. Attribute for identifying elements in tests.
 * @property {[x: string]: any} - Optional. Allows for any other properties not explicitly defined, ensuring flexibility.
 */
export interface InputProps {
  id?: string;
  name: string;
  type?: ValidInputTypes;
  placeholder?: string;
  label?: string;
  description?: string;
  className?: string;
  errors?: { [key: string]: { message: string; }; };
  dataTestId?: string;
  [x: string]: any;
}
