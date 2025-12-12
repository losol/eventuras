import { Meta, StoryFn } from '@storybook/react-vite';
import Container, { ContainerProps } from './Container';

const meta: Meta<typeof Container> = {
  component: Container,
  tags: ['autodocs'],
};

export default meta;

type ContainerStory = StoryFn<ContainerProps>;

export const Playground: ContainerStory = args => (
  <Container {...args}>
    <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
      <h2 className="text-2xl font-bold mb-2">Container Content</h2>
      <p>This content is inside a Container component.</p>
    </div>
  </Container>
);

export const Default: ContainerStory = () => (
  <Container>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
      <h2 className="text-2xl font-bold mb-2">Default Container</h2>
      <p>This is a default container with standard padding and margin.</p>
    </div>
  </Container>
);

export const CustomPadding: ContainerStory = () => (
  <Container padding="p-8">
    <div className="bg-green-100 dark:bg-green-900 p-4 rounded">
      <h2 className="text-2xl font-bold mb-2">Custom Padding</h2>
      <p>This container has custom padding (p-8).</p>
    </div>
  </Container>
);

export const NoPadding: ContainerStory = () => (
  <Container padding="p-0">
    <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded">
      <h2 className="text-2xl font-bold mb-2">No Padding</h2>
      <p>This container has no padding.</p>
    </div>
  </Container>
);

export const WithBorder: ContainerStory = () => (
  <Container border="border-2 border-blue-500 rounded-lg">
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">With Border</h2>
      <p>This container has a custom border.</p>
    </div>
  </Container>
);

export const FullWidth: ContainerStory = () => (
  <Container width="w-full" margin="m-0">
    <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded">
      <h2 className="text-2xl font-bold mb-2">Full Width Container</h2>
      <p>This container spans the full width with no margin.</p>
    </div>
  </Container>
);

export const MultipleContainers: ContainerStory = () => (
  <>
    <Container className="mb-4">
      <div className="bg-red-100 dark:bg-red-900 p-4 rounded">
        <h3 className="text-xl font-bold">Container 1</h3>
        <p>First container with content.</p>
      </div>
    </Container>
    <Container className="mb-4">
      <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
        <h3 className="text-xl font-bold">Container 2</h3>
        <p>Second container with content.</p>
      </div>
    </Container>
    <Container>
      <div className="bg-green-100 dark:bg-green-900 p-4 rounded">
        <h3 className="text-xl font-bold">Container 3</h3>
        <p>Third container with content.</p>
      </div>
    </Container>
  </>
);

export const WithComplexContent: ContainerStory = () => (
  <Container>
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Page Title</h1>
      <p className="text-lg">This is a container with more complex content structure.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-2">Section 1</h3>
          <p>Content for section 1</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-2">Section 2</h3>
          <p>Content for section 2</p>
        </div>
      </div>
    </div>
  </Container>
);
