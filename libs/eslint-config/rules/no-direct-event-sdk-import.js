/**
 * ESLint rule: no-direct-event-sdk-import
 *
 * Prevents direct imports from '@eventuras/event-sdk' in the apps/web codebase.
 * Requires using wrapper modules that ensure proper client configuration.
 *
 * @see /Users/ole/Kode/eventuras/apps/web/src/lib/eventuras-sdk.ts
 * @see /Users/ole/Kode/eventuras/apps/web/src/lib/eventuras-public-sdk.ts
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct imports from @eventuras/event-sdk, require using configured wrapper modules',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      noDirectImport:
        'Do not import directly from "@eventuras/event-sdk". Use "@/lib/eventuras-sdk" for authenticated requests or "@/lib/eventuras-public-sdk" for public/ISR pages.',
      useAuthenticatedWrapper:
        'Import from "@/lib/eventuras-sdk" instead to use the authenticated client.',
      usePublicWrapper:
        'Import from "@/lib/eventuras-public-sdk" instead for ISR/SSG pages (and pass publicClient explicitly).',
    },
    schema: [],
  },

  create(context) {
    // Only apply this rule to files in apps/web/src
    const filename = context.filename || context.getFilename();
    if (!filename.includes('apps/web/src')) {
      return {};
    }

    // Don't apply to the wrapper modules themselves
    if (
      filename.includes('eventuras-sdk.ts') ||
      filename.includes('eventuras-client.ts') ||
      filename.includes('eventuras-public-sdk.ts') ||
      filename.includes('eventuras-public-client.ts') ||
      filename.includes('eventuras-types.ts')
    ) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value === '@eventuras/event-sdk') {
          // Check if this is in a public/ISR page
          const isPublicPage =
            filename.includes('(public)') ||
            filename.includes('(frontpage)') ||
            filename.includes('generateStaticParams');

          context.report({
            node: node.source,
            messageId: 'noDirectImport',
            fix(fixer) {
              // Suggest fix based on file location
              const replacement = isPublicPage
                ? '"@/lib/eventuras-public-sdk"'
                : '"@/lib/eventuras-sdk"';

              return fixer.replaceText(node.source, replacement);
            },
          });
        }
      },
    };
  },
};
