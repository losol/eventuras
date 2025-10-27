const INVISIBLES = ['\u00A0', '\u200B', '\u200C', '\u200D', '\uFEFF'] as const;

/** Normalize text for rendering while preserving markdown syntax */
export function sanitizeMarkdown(input: string): string {
  // replace NBSP/ZW* with regular space
  let out = INVISIBLES.reduce((s, ch) => s.replaceAll(ch, ' '), input);

  // remove C0/C1 control characters except \n\r\t (preserve line breaks and tabs for markdown)
  // eslint-disable-next-line no-control-regex
  out = out.replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  // DON'T collapse whitespace - markdown needs it for formatting!
  // DON'T strip format characters aggressively - breaks markdown syntax

  // remove javascript: links but keep label
  out = out.replaceAll(/\[([^\]]+)\]\(\s*javascript:[^)]+\)/gi, '$1');
  // remove data: links but keep label
  out = out.replaceAll(/\[([^\]]+)\]\(\s*data:[^)]+\)/gi, '$1');

  // NFC compose
  return out.normalize('NFC');
}

export function stripUnsafeLinks(s: string): string {
  return (
    s
      // [label](javascript:...)
      .replaceAll(/\[([^\]]+)\]\(\s*javascript:[^)]+?(?:\s+(['"]).*?\2)?\s*\)/gi, '$1')
      // [label](data:...)
      .replaceAll(/\[([^\]]+)\]\(\s*data:[^)]+?(?:\s+(['"]).*?\2)?\s*\)/gi, '$1')
  );
}
