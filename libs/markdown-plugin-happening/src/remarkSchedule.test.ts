import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root, List } from 'mdast';
import { remarkSchedule } from './remarkSchedule';

/** Helper: parse markdown and run remarkSchedule, returning the AST. */
function process(md: string): Root {
  const processor = unified().use(remarkParse).use(remarkSchedule);
  return processor.runSync(processor.parse(md)) as Root;
}

/** Helper: find first list node in a tree. */
function findList(tree: Root): List | undefined {
  function walk(node: any): List | undefined {
    if (node.type === 'list') return node;
    if (node.children) {
      for (const child of node.children) {
        const found = walk(child);
        if (found) return found;
      }
    }
    return undefined;
  }
  return walk(tree);
}

describe('remarkSchedule', () => {
  it('transforms a schedule list into schedule-list/schedule-item nodes', () => {
    const md = [
      '- **09:00–09:30** Registration and coffee',
      '- **09:30–10:00** Welcome | Course committee',
      '- **10:00–11:00** Keynote | Dr. Maria Chen | A deep dive into distributed systems',
    ].join('\n');

    const tree = process(md);
    const list = findList(tree)!;

    expect(list.data).toEqual(
      expect.objectContaining({ hName: 'schedule-list' })
    );

    expect(list.children).toHaveLength(3);

    expect(list.children[0].data).toEqual(
      expect.objectContaining({
        hName: 'schedule-item',
        hProperties: {
          'data-time': '09:00–09:30',
          'data-title': 'Registration and coffee',
          'data-speaker': '',
          'data-description': '',
        },
      })
    );

    expect(list.children[1].data).toEqual(
      expect.objectContaining({
        hName: 'schedule-item',
        hProperties: {
          'data-time': '09:30–10:00',
          'data-title': 'Welcome',
          'data-speaker': 'Course committee',
          'data-description': '',
        },
      })
    );

    expect(list.children[2].data).toEqual(
      expect.objectContaining({
        hName: 'schedule-item',
        hProperties: {
          'data-time': '10:00–11:00',
          'data-title': 'Keynote',
          'data-speaker': 'Dr. Maria Chen',
          'data-description': 'A deep dive into distributed systems',
        },
      })
    );
  });

  it('handles single time (no range)', () => {
    const md = '- **19:00** Dinner';
    const tree = process(md);
    const list = findList(tree)!;

    expect(list.data).toEqual(
      expect.objectContaining({ hName: 'schedule-list' })
    );
    expect(list.children[0].data).toEqual(
      expect.objectContaining({
        hProperties: expect.objectContaining({
          'data-time': '19:00',
          'data-title': 'Dinner',
        }),
      })
    );
  });

  it('normalizes dots to colons in time', () => {
    const md = '- **09.30–10.00** Session';
    const tree = process(md);
    const list = findList(tree)!;

    expect(list.children[0].data).toEqual(
      expect.objectContaining({
        hProperties: expect.objectContaining({
          'data-time': '09:30–10:00',
        }),
      })
    );
  });

  it('leaves regular lists unchanged', () => {
    const md = [
      '- Item one',
      '- Item two',
      '- Item three',
    ].join('\n');

    const tree = process(md);
    const list = findList(tree)!;

    // No schedule data should be set
    expect(list.data?.hName).toBeUndefined();
  });

  it('leaves list unchanged if ANY item does not match', () => {
    const md = [
      '- **09:00–09:30** Registration',
      '- Just a regular item',
    ].join('\n');

    const tree = process(md);
    const list = findList(tree)!;

    expect(list.data?.hName).toBeUndefined();
  });

  it('leaves ordered lists unchanged even if items match', () => {
    const md = [
      '1. **09:00–09:30** Registration',
      '2. **09:30–10:00** Welcome',
    ].join('\n');

    const tree = process(md);
    const list = findList(tree)!;

    expect(list.data?.hName).toBeUndefined();
  });

  it('leaves list unchanged when bold text is not a time', () => {
    const md = '- **Important** Some text here';
    const tree = process(md);
    const list = findList(tree)!;

    expect(list.data?.hName).toBeUndefined();
  });

  it('leaves list unchanged when title is empty', () => {
    const md = '- **09:00–10:00**';
    const tree = process(md);
    const list = findList(tree)!;

    expect(list.data?.hName).toBeUndefined();
  });

  it('handles multiple lists in same document', () => {
    const md = [
      '- **09:00** Registration',
      '- **10:00** Talk',
      '',
      'Some paragraph',
      '',
      '- Regular item',
      '- Another item',
    ].join('\n');

    const tree = process(md);

    // Find all lists
    const lists: List[] = [];
    function walk(node: any) {
      if (node.type === 'list') lists.push(node);
      if (node.children) node.children.forEach(walk);
    }
    walk(tree);

    expect(lists).toHaveLength(2);
    expect(lists[0].data?.hName).toBe('schedule-list');
    expect(lists[1].data?.hName).toBeUndefined();
  });
});
