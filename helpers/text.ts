export function formatLanguageName(code: string) {
  const dashPosition = code.indexOf('-');

  if (dashPosition !== -1) {
    // If dash exists, return letters after dash
    return code.slice(dashPosition + 1).toUpperCase();
  }
  // If no dash exists, return all letters
  return code.toUpperCase();
}
