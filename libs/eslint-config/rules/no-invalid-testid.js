/**
 * ESLint rule to enforce data-testid usage on HTML elements
 *
 * This rule prevents the use of:
 * - data-test-id (old convention with hyphen)
 * - testId on HTML elements (should only be used on React components)
 *
 * Only data-testid should be used on HTML elements.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce data-testid on HTML elements, disallow data-test-id and testId',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      useDataTestId: 'Use "data-testid" instead of "data-test-id" on HTML elements.',
      noTestIdOnHtml: 'Use "data-testid" instead of "testId" on HTML elements. The "testId" prop is only for React components.',
    },
  },

  create(context) {
    const HTML_ELEMENTS = new Set([
      'div', 'span', 'p', 'a', 'button', 'input', 'textarea', 'select', 'option',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'form', 'label', 'img', 'nav', 'header', 'footer', 'section', 'article', 'aside',
      'main', 'figure', 'figcaption', 'time', 'mark', 'strong', 'em', 'code', 'pre',
      'blockquote', 'hr', 'br', 'iframe', 'video', 'audio', 'canvas', 'svg', 'path',
    ]);

    function isHTMLElement(node) {
      if (node.type !== 'JSXOpeningElement') return false;

      const elementName = node.name.name;
      if (!elementName) return false;

      // Check if it's a lowercase element (HTML) or uppercase (React component)
      return elementName[0] === elementName[0].toLowerCase() && HTML_ELEMENTS.has(elementName);
    }

    function getAttributeValue(attr) {
      if (!attr.value) return null;

      if (attr.value.type === 'Literal') {
        return attr.value.value;
      }

      if (attr.value.type === 'JSXExpressionContainer') {
        if (attr.value.expression.type === 'Literal') {
          return attr.value.expression.value;
        }
      }

      return null;
    }

    return {
      JSXOpeningElement(node) {
        if (!isHTMLElement(node)) return;

        for (const attr of node.attributes) {
          if (attr.type !== 'JSXAttribute') continue;

          const attrName = attr.name.name;

          // Check for data-test-id (old convention)
          if (attrName === 'data-test-id') {
            context.report({
              node: attr,
              messageId: 'useDataTestId',
              fix(fixer) {
                return fixer.replaceText(attr.name, 'data-testid');
              },
            });
          }

          // Check for testId on HTML elements (should only be on React components)
          if (attrName === 'testId') {
            context.report({
              node: attr,
              messageId: 'noTestIdOnHtml',
              fix(fixer) {
                // Get the value to preserve it
                const sourceCode = context.getSourceCode();
                const attrValue = sourceCode.getText(attr.value);

                return fixer.replaceText(attr, `data-testid=${attrValue}`);
              },
            });
          }
        }
      },
    };
  },
};
