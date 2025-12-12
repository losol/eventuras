import { Meta, StoryFn } from '@storybook/react-vite';
import Grid from './Grid';

const meta: Meta<typeof Grid> = {
  component: Grid,
  tags: ['autodocs'],
  args: {
    cols: { md: 2, lg: 3 },
    container: false,
  },
};

export default meta;

type GridStory = StoryFn<typeof Grid>;

const DemoCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded text-center">{children}</div>
);

export const Playground: GridStory = args => (
  <Grid {...args}>
    <DemoCard>Item 1</DemoCard>
    <DemoCard>Item 2</DemoCard>
    <DemoCard>Item 3</DemoCard>
    <DemoCard>Item 4</DemoCard>
    <DemoCard>Item 5</DemoCard>
    <DemoCard>Item 6</DemoCard>
  </Grid>
);

export const TwoColumns: GridStory = () => (
  <Grid cols={{ md: 2 }}>
    <DemoCard>Column 1</DemoCard>
    <DemoCard>Column 2</DemoCard>
    <DemoCard>Column 3</DemoCard>
    <DemoCard>Column 4</DemoCard>
  </Grid>
);

export const ThreeColumns: GridStory = () => (
  <Grid cols={{ md: 3 }}>
    <DemoCard>Item 1</DemoCard>
    <DemoCard>Item 2</DemoCard>
    <DemoCard>Item 3</DemoCard>
    <DemoCard>Item 4</DemoCard>
    <DemoCard>Item 5</DemoCard>
    <DemoCard>Item 6</DemoCard>
  </Grid>
);

export const ResponsiveGrid: GridStory = () => (
  <Grid cols={{ sm: 1, md: 2, lg: 4 }}>
    <DemoCard>Item 1</DemoCard>
    <DemoCard>Item 2</DemoCard>
    <DemoCard>Item 3</DemoCard>
    <DemoCard>Item 4</DemoCard>
    <DemoCard>Item 5</DemoCard>
    <DemoCard>Item 6</DemoCard>
    <DemoCard>Item 7</DemoCard>
    <DemoCard>Item 8</DemoCard>
  </Grid>
);

export const WithContainer: GridStory = () => (
  <Grid cols={{ md: 3 }} container>
    <DemoCard>Item 1</DemoCard>
    <DemoCard>Item 2</DemoCard>
    <DemoCard>Item 3</DemoCard>
  </Grid>
);

export const WithPadding: GridStory = () => (
  <Grid cols={{ md: 2, lg: 3 }} paddingClassName="p-8">
    <DemoCard>Item 1</DemoCard>
    <DemoCard>Item 2</DemoCard>
    <DemoCard>Item 3</DemoCard>
    <DemoCard>Item 4</DemoCard>
  </Grid>
);

export const WithWrapper: GridStory = () => (
  <Grid cols={{ md: 2 }} wrapperClassName="bg-gray-100 dark:bg-gray-800 p-4 rounded">
    <DemoCard>Item 1</DemoCard>
    <DemoCard>Item 2</DemoCard>
    <DemoCard>Item 3</DemoCard>
    <DemoCard>Item 4</DemoCard>
  </Grid>
);

export const ProductGrid: GridStory = () => (
  <Grid cols={{ sm: 1, md: 2, lg: 3 }}>
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div className="bg-gray-200 dark:bg-gray-700 h-32 mb-2 rounded"></div>
      <h3 className="font-bold">Product 1</h3>
      <p className="text-gray-600 dark:text-gray-400">$99.99</p>
    </div>
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div className="bg-gray-200 dark:bg-gray-700 h-32 mb-2 rounded"></div>
      <h3 className="font-bold">Product 2</h3>
      <p className="text-gray-600 dark:text-gray-400">$149.99</p>
    </div>
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div className="bg-gray-200 dark:bg-gray-700 h-32 mb-2 rounded"></div>
      <h3 className="font-bold">Product 3</h3>
      <p className="text-gray-600 dark:text-gray-400">$199.99</p>
    </div>
  </Grid>
);
