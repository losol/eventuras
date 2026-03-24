import type { SanitizeSchemaExtension } from './MarkdownContent';

/**
 * Merges multiple sanitize schema extensions into one.
 */
export function mergeSanitizeSchemas(
  ...schemas: SanitizeSchemaExtension[]
): SanitizeSchemaExtension {
  return {
    tagNames: schemas.flatMap((s) => s.tagNames ?? []),
    attributes: Object.assign({}, ...schemas.map((s) => s.attributes ?? {})),
  };
}
