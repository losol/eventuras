import { Block, Field } from 'payload';

import { Content } from '@/blocks/Content/config';

/**
 * A function that creates a field configuration for a "story" field in an object or form.
 * The field is of type "blocks" and allows specifying a customizable set of block types.
 *
 * @param {Block[]} [blocks=[Content]] - An array of block types that are permitted in the "story" field. Defaults to a single block type, `Content`.
 * @returns {Field} The configuration object for the "story" field, including its name, label, type, and allowed block types.
 */
export const storyField = (blocks: Block[] = [Content]): Field => ({
  name: 'story',
  label: 'Story',
  type: 'blocks',
  blocks: blocks,
});
