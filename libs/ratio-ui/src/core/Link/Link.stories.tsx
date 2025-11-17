import { Meta, StoryFn } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Link, LinkProps } from './Link';

const meta: Meta<typeof Link> = {
  component: Link,
  tags: ['autodocs'],
  args: {
    href: '#',
    children: 'Link text',
    variant: undefined,
    block: false,
    onDark: false,
    linkOverlay: false,
  },
  argTypes: {
    href: { control: 'text' },
    children: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: [undefined, 'button-primary', 'button-secondary', 'button-light', 'button-outline', 'button-text'],
      description: 'Style the link as a button',
    },
    block: { control: 'boolean' },
    onDark: { control: 'boolean' },
    linkOverlay: { control: 'boolean' },
  },
};

export default meta;

type LinkStory = StoryFn<LinkProps>;

const Template: LinkStory = (args) => <Link {...args} />;

export const Playground = Template.bind({});
Playground.storyName = 'Playground';

export const Default = Template.bind({});
Default.args = {
  href: 'https://example.com',
  children: 'Default link',
};

export const ExternalLink = Template.bind({});
ExternalLink.args = {
  href: 'https://eventuras.com',
  children: 'Visit Eventuras',
};

export const InternalLink = Template.bind({});
InternalLink.args = {
  href: '/events',
  children: 'Go to events',
};

export const ButtonPrimary = Template.bind({});
ButtonPrimary.args = {
  href: '#',
  variant: 'button-primary',
  children: 'Primary Button Link',
};

export const ButtonSecondary = Template.bind({});
ButtonSecondary.args = {
  href: '#',
  variant: 'button-secondary',
  children: 'Secondary Button Link',
};

export const ButtonOutline = Template.bind({});
ButtonOutline.args = {
  href: '#',
  variant: 'button-outline',
  children: 'Outline Button Link',
};

export const ButtonLight = Template.bind({});
ButtonLight.args = {
  href: '#',
  variant: 'button-light',
  children: 'Light Button Link',
};

export const ButtonText = Template.bind({});
ButtonText.args = {
  href: '#',
  variant: 'button-text',
  children: 'Text Button Link',
};

export const BlockLink = Template.bind({});
BlockLink.args = {
  href: '#',
  block: true,
  children: 'Block level link',
};

export const AllVariants = () => {
  const variants: Array<LinkProps['variant']> = [
    undefined,
    'button-primary',
    'button-secondary',
    'button-outline',
    'button-light',
    'button-text',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 font-semibold">Text Links</h4>
        <div className="space-y-2">
          <div>
            <Link href="#">Default text link</Link>
          </div>
          <div>
            <Link href="#" block>
              Block text link
            </Link>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-2 font-semibold">Button Variants</h4>
        <div className="flex flex-wrap gap-2">
          {variants
            .filter((v) => v?.startsWith('button-'))
            .map((variant) => (
              <Link key={variant} href="#" variant={variant}>
                {variant}
              </Link>
            ))}
        </div>
      </div>

      <div className="bg-gray-900 p-4 rounded">
        <h4 className="mb-2 font-semibold text-white">On Dark Background</h4>
        <div className="flex flex-wrap gap-2">
          <Link href="#" onDark>
            Text link
          </Link>
          <Link href="#" variant="button-primary" onDark>
            Primary
          </Link>
          <Link href="#" variant="button-secondary" onDark>
            Secondary
          </Link>
        </div>
      </div>
    </div>
  );
};
AllVariants.storyName = 'All Variants';

// Tests
let clickSpy: ReturnType<typeof fn>;

export const LinkTest = {
  render: () => {
    clickSpy = fn();

    return (
      <div className="flex flex-col gap-2">
        <Link href="#test" componentProps={{ onClick: clickSpy }}>
          Test Link
        </Link>
        <Link href="#button" variant="button-primary" componentProps={{ onClick: clickSpy }}>
          Button Link
        </Link>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    const textLink = canvas.getByRole('link', { name: 'Test Link' });
    const buttonLink = canvas.getByRole('link', { name: 'Button Link' });

    // Verify links are rendered
    await expect(textLink).toBeInTheDocument();
    await expect(buttonLink).toBeInTheDocument();

    // Test clicks
    await userEvent.click(textLink);
    await expect(clickSpy).toHaveBeenCalledTimes(1);

    await userEvent.click(buttonLink);
    await expect(clickSpy).toHaveBeenCalledTimes(2);
  },
};
