/**
 * Generic interface for properties of input components.
 *
 * @param id - Optional. The unique identifier for the input element.
 * @param name - Required. The name of the input element, used for form submission and linking with labels.
 * @param type - Optional. Specifies the type of input (e.g., 'text', 'email', 'password'). Defaults to 'text'.
 * @param placeholder - Optional. Provides a hint to the user about what to enter in the input.
 * @param label - Optional. The text label associated with the input element.
 * @param description - Optional. A description of the input element.
 * @param className - Optional. Additional CSS classes to apply to the input element for styling.
 * @param errors - Optional. An object containing error messages, with keys corresponding to input names.
 * @param [x: string]: any - Optional. Allows for any other properties not explicitly defined in the interface.
 */
export interface InputProps {
  id?: string;
  name: string;
  type?: string;
  placeholder?: string;
  label?: string;
  description?: string;
  className?: string;
  errors?: { [key: string]: { message: string } };
  dataTestId?: string;
  [x: string]: any;
}
