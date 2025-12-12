import { Meta, StoryFn } from '@storybook/react-vite';
import { Text, TextProps } from './Text';

const meta: Meta<typeof Text> = {
  component: Text,
  tags: ['autodocs'],
  args: {
    as: 'div',
  },
  argTypes: {
    text: { control: 'text' },
    as: {
      control: { type: 'select' },
      options: ['div', 'span', 'p'],
    },
    className: { control: 'text' },
  },
};

export default meta;

type TextStory = StoryFn<TextProps>;

const Template: TextStory = args => <Text {...args} />;

export const Playground = Template.bind({});
Playground.args = {
  text: 'This is a text component',
};

export const WithChildren = Template.bind({});
WithChildren.args = {
  children: 'Text using children prop',
};

export const AsSpan = Template.bind({});
AsSpan.args = {
  text: 'This is a span element',
  as: 'span',
};

export const AsParagraph = Template.bind({});
AsParagraph.args = {
  text: 'This is a paragraph element',
  as: 'p',
};

export const WithCustomClass = Template.bind({});
WithCustomClass.args = {
  text: 'Text with custom styling',
  className: 'text-blue-600 font-bold text-lg',
};

export const WithPadding = Template.bind({});
WithPadding.args = {
  text: 'Text with padding',
  padding: '4',
  className: 'bg-gray-100',
};
