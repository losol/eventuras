import { Meta, StoryFn } from '@storybook/react-vite';
import Section, { SectionProps } from './Section';

const meta: Meta<typeof Section> = {
  component: Section,
  tags: ['autodocs'],
  args: {
    container: true,
  },
  argTypes: {
    container: { control: 'boolean' },
  },
};

export default meta;

type SectionStory = StoryFn<SectionProps>;

export const Playground: SectionStory = args => (
  <Section {...args}>
    <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
      <h2 className="text-2xl font-bold mb-2">Section Content</h2>
      <p>This is content inside a Section component.</p>
    </div>
  </Section>
);

export const WithContainer: SectionStory = () => (
  <Section container>
    <h2 className="text-2xl font-bold mb-4">Section with Container</h2>
    <p>This section has a fixed-width container wrapping the content.</p>
  </Section>
);

export const WithoutContainer: SectionStory = () => (
  <Section container={false}>
    <div className="bg-gray-100 dark:bg-gray-800 p-4">
      <h2 className="text-2xl font-bold mb-4">Full Width Section</h2>
      <p>This section does not have a container and spans the full width.</p>
    </div>
  </Section>
);

export const WithPadding: SectionStory = () => (
  <Section padding="p-8">
    <h2 className="text-2xl font-bold mb-4">Section with Padding</h2>
    <p>This section has custom padding applied.</p>
  </Section>
);

export const WithBackground: SectionStory = () => (
  <Section className="bg-blue-600 text-white" padding="py-12">
    <h2 className="text-3xl font-bold mb-4">Hero Section</h2>
    <p className="text-lg">This section has a custom background color.</p>
  </Section>
);

export const MultipleSections: SectionStory = () => (
  <>
    <Section className="bg-gray-50 dark:bg-gray-900" padding="py-8">
      <h2 className="text-2xl font-bold mb-4">First Section</h2>
      <p>Content for the first section.</p>
    </Section>
    <Section className="bg-white dark:bg-gray-800" padding="py-8">
      <h2 className="text-2xl font-bold mb-4">Second Section</h2>
      <p>Content for the second section.</p>
    </Section>
    <Section className="bg-gray-50 dark:bg-gray-900" padding="py-8">
      <h2 className="text-2xl font-bold mb-4">Third Section</h2>
      <p>Content for the third section.</p>
    </Section>
  </>
);

export const FullWidthHero: SectionStory = () => (
  <Section
    container={false}
    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
    padding="py-20"
  >
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Eventuras</h1>
      <p className="text-xl mb-8">Manage your events with ease</p>
      <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
        Get Started
      </button>
    </div>
  </Section>
);

export const ContentSection: SectionStory = () => (
  <Section padding="py-12">
    <h2 className="text-3xl font-bold mb-6">Features</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Feature 1</h3>
        <p>Description of feature 1</p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Feature 2</h3>
        <p>Description of feature 2</p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Feature 3</h3>
        <p>Description of feature 3</p>
      </div>
    </div>
  </Section>
);
