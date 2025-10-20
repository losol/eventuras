/**
 * Regular expressions for common validation patterns.
 * @module regex
 */

/**
 * Validates international phone numbers in E.164 format.
 * Format: +[country code][number] (1-15 digits total after +)
 * @example "+4712345678", "+14155552671"
 */
export const internationalPhoneNumber = /^\+[1-9]{1}[0-9]{1,14}$/;

/**
 * Validates strings containing only letters (Unicode-aware).
 * Supports all Unicode letter characters including diacritics.
 * @example "Hello", "Bjørn", "José"
 */
export const letters = /^[\p{L}]+$/u;

/**
 * Validates strings containing only letters and spaces (Unicode-aware).
 * Supports all Unicode letter characters including diacritics.
 * @example "Hello World", "Bjørn Hansen", "María José"
 */
export const lettersAndSpace = /^[\p{L} ]+$/u;

/**
 * Validates strings containing letters, spaces, and hyphens (Unicode-aware).
 * Supports all Unicode letter characters including diacritics.
 * Useful for names with hyphenation.
 * @example "Jean-Pierre", "Mary-Anne Smith", "Müller-Schmidt"
 */
export const lettersSpaceAndHyphen = /^[\p{L} -]+$/u;
