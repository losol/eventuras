import { Meta, StoryFn } from '@storybook/react-vite';
import { List, ListProps, ListItem } from './List';

const meta: Meta<typeof List> = {
  component: List,
  tags: ['autodocs'],
  args: {
    as: 'ul',
    variant: 'unstyled',
  },
  argTypes: {
    as: {
      control: { type: 'select' },
      options: ['ul', 'ol'],
    },
    variant: {
      control: { type: 'select' },
      options: ['unstyled', 'markdown', 'markdown-compact'],
    },
  },
};

export default meta;

type ListStory = StoryFn<ListProps>;

export const Playground: ListStory = args => (
  <List {...args}>
    <ListItem>First item</ListItem>
    <ListItem>Second item</ListItem>
    <ListItem>Third item</ListItem>
  </List>
);

export const UnorderedList: ListStory = () => (
  <List as="ul" variant="markdown">
    <ListItem>First item in the list</ListItem>
    <ListItem>Second item in the list</ListItem>
    <ListItem>Third item in the list</ListItem>
    <ListItem>Fourth item in the list</ListItem>
  </List>
);

export const OrderedList: ListStory = () => (
  <List as="ol" variant="markdown">
    <ListItem>First step</ListItem>
    <ListItem>Second step</ListItem>
    <ListItem>Third step</ListItem>
  </List>
);

export const CheckList: ListStory = () => (
  <List as="ul" variant="unstyled">
    <ListItem variant="check">Item completed successfully</ListItem>
    <ListItem variant="check">Another completed item</ListItem>
    <ListItem variant="check">Third completed item</ListItem>
  </List>
);

export const WithItemsArray: ListStory = () => (
  <List
    variant="markdown"
    items={[
      { key: 1, text: 'First item from array' },
      { key: 2, text: 'Second item from array' },
      { key: 3, text: 'Third item from array' },
    ]}
  />
);

export const MarkdownCompact: ListStory = () => (
  <List as="ul" variant="markdown-compact">
    <ListItem>Compact list item one</ListItem>
    <ListItem>Compact list item two</ListItem>
    <ListItem>Compact list item three</ListItem>
  </List>
);

export const CustomStyling: ListStory = () => (
  <List as="ul" className="bg-gray-50 p-4 rounded" itemClassName="font-semibold">
    <ListItem>Custom styled item</ListItem>
    <ListItem>Another custom item</ListItem>
    <ListItem>Third custom item</ListItem>
  </List>
);
