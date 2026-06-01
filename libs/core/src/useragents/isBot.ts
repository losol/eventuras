import patterns from './patterns.json' with { type: 'json' };

// Patterns vendored from https://github.com/omrilotan/isbot (Unlicense /
// public domain) so the same list can be used in browser, edge, and server
// runtimes without an extra npm dependency. Refresh `patterns.json` from
// upstream when newly-prevalent crawlers start polluting events.
//
// The patterns are designed to be joined into a single case-insensitive
// regex; building it once at module load avoids paying that cost per call.
const botPattern = new RegExp((patterns as readonly string[]).join('|'), 'i');

export const isBot = (userAgent: string | null | undefined): boolean => {
  if (!userAgent) {
    return false;
  }
  return botPattern.test(userAgent);
};
