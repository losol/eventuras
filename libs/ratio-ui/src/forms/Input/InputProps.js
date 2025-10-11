"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
 * @property {string} [data-test-id] - Optional. Attribute for identifying elements in tests.
 * @property {[x: string]: any} - Optional. Allows for any other properties not explicitly defined, ensuring flexibility.
 */
var utils_1 = require("@eventuras/utils");
