const INVISIBLES = ['\u00A0', '\u200B', '\u200C', '\u200D', '\uFEFF'] as const;

/**
 * Normalize text for rendering while preserving markdown syntax.
 * - Replaces invisible characters (NBSP, zero-width) with regular spaces
 * - Removes control characters except newlines, carriage returns, and tabs
 * - Unescapes backslash-escaped markdown characters (e.g., \*\* → **)
 * - NFC normalizes unicode
 *
 * Note: XSS protection (javascript:, data: links) is handled by rehype-sanitize
 */
export function normalizeMarkdown(input: string): string {
  // replace NBSP/ZW* with regular space
  let out = INVISIBLES.reduce((s, ch) => s.replaceAll(ch, ' '), input);

  // remove C0/C1 control characters except \n\r\t (preserve line breaks and tabs for markdown)
  // eslint-disable-next-line no-control-regex
  out = out.replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  // Unescape backslash-escaped markdown characters
  // Common markdown special chars that might be escaped: * _ ` # [ ] ( ) ! + - . > |
  out = out.replaceAll(/\\([*_`#\[\]()!+\-.>|\\])/g, '$1');

  // NFC compose
  return out.normalize('NFC');
}
