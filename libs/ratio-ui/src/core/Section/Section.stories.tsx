import { Meta, StoryFn } from '@storybook/react-vite';
import Section, { SectionProps } from './Section';
import { Image } from '../Image';
import { Box } from '../../layout/Box';
import { Heading } from '../Heading';
import { Button } from '../Button';

const meta: Meta<typeof Section> = {
  component: Section,
  tags: ['autodocs'],
  args: {
    container: true,
  },
  argTypes: {
    container: { control: 'boolean' },
    grid: { control: 'boolean' },
    gap: {
      control: 'select',
      options: ['4', '6', '8'],
    },
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
      <Button variant="secondary">Get Started</Button>
    </div>
  </Section>
);

export const ContentSection: SectionStory = () => (
  <Section padding="py-12">
    <Heading as="h2" className="mb-6">Features</Heading>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <Heading as="h3">Feature 1</Heading>
        <p>Description of feature 1</p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <Heading as="h3">Feature 2</Heading>
        <p>Description of feature 2</p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <Heading as="h3">Feature 3</Heading>
        <p>Description of feature 3</p>
      </div>
    </div>
  </Section>
);

// New grid-based stories
export const GridWithImage: SectionStory = () => (
  <Section grid padding="py-12">
    <Image
      src="https://picsum.photos/800/600"
      alt="Hero image"
      imgClassName="w-full h-auto object-cover rounded-lg"
    />
    <Box>
      <Heading as="h2" className="mb-4">Hero Section with Grid</Heading>
      <p className="text-lg mb-4">
        This section uses the grid layout to display an image alongside content.
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        On mobile, the image stacks above the content. On desktop, they appear side by side.
      </p>
    </Box>
  </Section>
);

export const GridFullWidthWithColor: SectionStory = () => (
  <Section
    grid
    container={false}
    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
    padding="py-16 px-8"
  >
    <Image
      src="https://picsum.photos/800/600?random=1"
      alt="Product showcase"
      imgClassName="w-full h-auto object-cover rounded-lg"
    />
    <Box className="flex flex-col justify-center">
      <Heading as="h2" className="mb-4">Full Width Hero</Heading>
      <p className="text-xl mb-6">
        No container, full width background with grid layout.
      </p>
      <p className="text-lg opacity-90">
        Perfect for hero sections and landing pages.
      </p>
    </Box>
  </Section>
);

export const GridContainerWithLargeGap: SectionStory = () => (
  <Section grid gap="8" padding="py-12">
    <Image
      src="https://picsum.photos/800/600?random=2"
      alt="Feature image"
      imgClassName="w-full h-auto object-cover rounded-lg"
    />
    <Box>
      <Heading as="h2" className="mb-4">Large Gap Grid</Heading>
      <p className="text-lg mb-4">
        Container-based section with large gap between grid columns.
      </p>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The gap setting controls spacing between the image and content.
      </p>
      <Button variant="primary">Learn More</Button>
    </Box>
  </Section>
);

export const GridSmallGap: SectionStory = () => (
  <Section grid gap="4" className="bg-gray-50 dark:bg-gray-900" padding="py-12">
    <Image
      src="https://picsum.photos/800/600?random=3"
      alt="Compact layout"
      imgClassName="w-full h-auto object-cover rounded-lg"
    />
    <Box>
      <Heading as="h3" className="mb-3">Small Gap - Compact Layout</Heading>
      <p className="mb-3">
        This grid uses a small gap for a more compact appearance.
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Ideal for content-dense sections where you want elements closer together.
      </p>
    </Box>
  </Section>
);

export const GridReverseLayout: SectionStory = () => (
  <Section grid padding="py-12">
    <Box className="order-2 md:order-1">
      <Heading as="h2" className="mb-4">Content First on Desktop</Heading>
      <p className="text-lg mb-4">
        Using Tailwind's order utilities, you can reverse the grid layout on different screen sizes.
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        On mobile, the image still appears first. On desktop, the content comes first.
      </p>
    </Box>
    <Image
      src="https://picsum.photos/800/600?random=4"
      alt="Reversed layout"
      imgClassName="w-full h-auto object-cover rounded-lg order-1 md:order-2"
    />
  </Section>
);
