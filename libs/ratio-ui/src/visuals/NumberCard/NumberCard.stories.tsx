import { Meta, StoryFn } from '@storybook/react-vite';
import NumberCard from './NumberCard';

const meta: Meta<typeof NumberCard> = {
  component: NumberCard,
  tags: ['autodocs'],
  args: {
    number: 42,
    label: 'Label',
  },
  argTypes: {
    number: { control: 'number' },
    label: { control: 'text' },
  },
};

export default meta;

type NumberCardStory = StoryFn<typeof NumberCard>;

export const Playground: NumberCardStory = args => <NumberCard {...args} />;

export const Basic: NumberCardStory = () => <NumberCard number={42} label="Total Events" />;

export const LargeNumber: NumberCardStory = () => <NumberCard number={1234} label="Registrations" />;

export const SmallNumber: NumberCardStory = () => <NumberCard number={3} label="Active Users" />;

export const Undefined: NumberCardStory = () => <NumberCard number={undefined} label="Loading..." />;

export const MultipleCards: NumberCardStory = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <NumberCard number={42} label="Total Events" />
    <NumberCard number={327} label="Participants" />
    <NumberCard number={15} label="Organizers" />
  </div>
);

export const Dashboard: NumberCardStory = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <NumberCard number={156} label="Total Events" />
    <NumberCard number={2341} label="Registrations" />
    <NumberCard number={89} label="Active Events" />
    <NumberCard number={42} label="Organizations" />
  </div>
);

export const WithCustomStyling: NumberCardStory = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <NumberCard
      number={100}
      label="Completed"
      className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    />
    <NumberCard
      number={25}
      label="Pending"
      className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
    />
    <NumberCard
      number={5}
      label="Failed"
      className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
    />
  </div>
);

export const Statistics: NumberCardStory = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Event Statistics</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <NumberCard number={47} label="Events This Month" />
      <NumberCard number={892} label="Total Participants" />
      <NumberCard number={34} label="Active Organizers" />
      <NumberCard number={12} label="Upcoming Events" />
    </div>
  </div>
);

export const Loading: NumberCardStory = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <NumberCard number={undefined} label="Loading Events..." />
    <NumberCard number={undefined} label="Loading Users..." />
    <NumberCard number={undefined} label="Loading Stats..." />
  </div>
);
