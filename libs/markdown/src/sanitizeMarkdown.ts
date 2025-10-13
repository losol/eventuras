const INVISIBLES = ['\u00A0', '\u200B', '\u200C', '\u200D', '\uFEFF'] as const

/** Normalize text for rendering */
export function sanitizeMarkdown(input: string): string {
  // replace NBSP/ZW* with space
  let out = INVISIBLES.reduce((s, ch) => s.replaceAll(ch, ' '), input)
  // remove C0/C1 controls except \n\r\t
  out = out.replaceAll(/[^\S\r\n\t]|\p{Cf}/gu, ' ') // Zs + format chars → space
  out = out.replaceAll(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
  // collapse whitespace
  out = out.replaceAll(/\s{2,}/g, ' ').trim()
  // remove javascript: links but keep label
  out = out.replaceAll(/\[([^\]]+)\]\(\s*javascript:[^)]+\)/gi, '$1')
  // remove data: links but keep label
  out = out.replaceAll(/\[([^\]]+)\]\(\s*data:[^)]+\)/gi, '$1')
  // NFC compose
  return out.normalize('NFC')
}

export function stripUnsafeLinks(s: string): string {
  return (
    s
      // [label](javascript:...)
      .replace(/\[([^\]]+)\]\(\s*javascript:[^)]+?(?:\s+(['"]).*?\2)?\s*\)/gi, '$1')
      // [label](data:...)
      .replace(/\[([^\]]+)\]\(\s*data:[^)]+?(?:\s+(['"]).*?\2)?\s*\)/gi, '$1')
  )
}
