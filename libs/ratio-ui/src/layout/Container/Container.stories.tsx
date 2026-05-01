import React from 'react';
import { Meta, StoryFn } from '@storybook/react-vite';
import { Container, type ContainerProps } from './Container';

const meta: Meta<typeof Container> = {
  component: Container,
  tags: ['autodocs'],
  argTypes: (() => {
    const space = [undefined, 'none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;
    const spaceCtrl = { control: 'inline-radio', options: space } as const;
    return {
      size: {
        control: 'inline-radio',
        options: ['sm', 'md', 'lg', 'xl', 'full'],
      },
      as: { control: 'text' },
      padding: spaceCtrl,
      paddingX: spaceCtrl,
      paddingY: spaceCtrl,
      paddingTop: spaceCtrl,
      paddingBottom: spaceCtrl,
      margin: spaceCtrl,
      marginX: spaceCtrl,
      marginY: spaceCtrl,
      marginTop: spaceCtrl,
      marginBottom: spaceCtrl,
      gap: spaceCtrl,
      color: {
        control: 'select',
        options: [
          undefined,
          'neutral',
          'primary',
          'secondary',
          'accent',
          'success',
          'warning',
          'error',
          'info',
        ],
      },
      radius: {
        control: 'inline-radio',
        options: [undefined, 'none', 'sm', 'md', 'lg', 'xl', 'full'],
      },
      border: {
        control: 'inline-radio',
        options: [undefined, false, true, 'subtle', 'default', 'strong'],
      },
      borderColor: {
        control: 'select',
        options: [
          undefined,
          'default',
          'subtle',
          'strong',
          'neutral',
          'primary',
          'secondary',
          'accent',
          'success',
          'warning',
          'error',
          'info',
        ],
      },
      dark: { control: 'boolean' },
    };
  })(),
};

export default meta;

type ContainerStory = StoryFn<ContainerProps>;

/**
 * Three-layer demo so you can see what each token does:
 *  - outer (page bg)        — striped sky/indigo, shows margin
 *  - container (the thing)  — sky-200 / sky-800, shows the Container's box
 *  - content (children)     — amber-200 / amber-800, shows what padding eats
 */
const PageBg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-fuchsia-100 dark:bg-fuchsia-950 p-2 rounded">{children}</div>
);

const containerBg = 'bg-sky-200 dark:bg-sky-800';
const contentBg = 'bg-amber-200 dark:bg-amber-800 rounded p-2';

const Content: React.FC<{ children?: React.ReactNode }> = ({ children = 'content' }) => (
  <div className={contentBg}>{children}</div>
);

export const Playground: ContainerStory = args => (
  <PageBg>
    <Container {...args} className={containerBg}>
      <Content>Container content</Content>
    </Container>
  </PageBg>
);
Playground.args = {
  size: 'lg',
  paddingY: 'md',
};

export const Default: ContainerStory = () => (
  <PageBg>
    <Container className={containerBg} paddingY="md">
      <Content>Default container (size=lg, paddingY=md)</Content>
    </Container>
  </PageBg>
);

export const Sizes: ContainerStory = () => (
  <PageBg>
    <div className="space-y-4">
      {(['sm', 'md', 'lg', 'xl', 'full'] as const).map(size => (
        <Container
          key={size}
          size={size}
          className={containerBg}
          border="subtle"
          radius="md"
          paddingY="md"
        >
          <Content>size="{size}"</Content>
        </Container>
      ))}
    </div>
  </PageBg>
);

export const PaddingShowcase: ContainerStory = () => (
  <PageBg>
    <div className="space-y-4">
      {(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map(p => (
        <Container key={p} className={containerBg} radius="md" padding={p}>
          <Content>padding="{p}"</Content>
        </Container>
      ))}
    </div>
  </PageBg>
);

export const PaddingXY: ContainerStory = () => (
  <PageBg>
    <Container className={containerBg} radius="md" paddingX="xl" paddingY="sm">
      <Content>paddingX="xl", paddingY="sm" — wide horizontally, tight vertically</Content>
    </Container>
  </PageBg>
);

export const MarginShowcase: ContainerStory = () => (
  <PageBg>
    <Container className={containerBg} radius="md" paddingY="md" marginY="lg">
      <Content>marginY="lg" — note the striped page bg above and below</Content>
    </Container>
    <Container className={containerBg} radius="md" paddingY="md">
      <Content>(no margin) — sits flush against neighbours</Content>
    </Container>
  </PageBg>
);

export const GapShowcase: ContainerStory = () => (
  <PageBg>
    <Container className={`${containerBg} flex flex-col`} radius="md" paddingY="md" gap="lg">
      <Content>child 1 (gap="lg" between siblings)</Content>
      <Content>child 2</Content>
      <Content>child 3</Content>
    </Container>
  </PageBg>
);

export const WithVerticalPadding: ContainerStory = () => (
  <PageBg>
    <Container paddingY="lg" border="subtle" radius="md" className={containerBg}>
      <Content>paddingY="lg"</Content>
    </Container>
  </PageBg>
);

export const WithColor: ContainerStory = () => (
  <PageBg>
    <Container color="primary" paddingY="md" radius="lg">
      <Content>color=primary (uses surface tokens)</Content>
    </Container>
  </PageBg>
);

export const WithBorder: ContainerStory = () => (
  <PageBg>
    <Container border="strong" borderColor="primary" radius="lg" paddingY="md">
      <Content>border=strong, borderColor=primary</Content>
    </Container>
  </PageBg>
);

export const Dark: ContainerStory = () => (
  <PageBg>
    <Container dark color="neutral" paddingY="md" radius="lg">
      <Content>dark surface</Content>
    </Container>
  </PageBg>
);

export const FullWidth: ContainerStory = () => (
  <PageBg>
    <Container size="full" paddingX="none" paddingY="md" className={containerBg}>
      <Content>size="full", paddingX="none" — fills the viewport</Content>
    </Container>
  </PageBg>
);

export const PolymorphicAsMain: ContainerStory = () => (
  <PageBg>
    <Container as="main" paddingY="md" className={containerBg}>
      <Content>as="main"</Content>
    </Container>
  </PageBg>
);

export const Stacked: ContainerStory = () => (
  <PageBg>
    <div className="space-y-4">
      <Container border="subtle" radius="md" paddingY="md" className={containerBg}>
        <Content>Container 1</Content>
      </Container>
      <Container border="subtle" radius="md" paddingY="md" className={containerBg}>
        <Content>Container 2</Content>
      </Container>
      <Container border="subtle" radius="md" paddingY="md" className={containerBg}>
        <Content>Container 3</Content>
      </Container>
    </div>
  </PageBg>
);

export const WithComplexContent: ContainerStory = () => (
  <PageBg>
    <Container paddingY="md" gap="md" className={`${containerBg} flex flex-col`}>
      <h1 className="text-3xl font-bold">Page title</h1>
      <p className="text-lg">A container with rich content layout.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={contentBg}>
          <h3 className="font-semibold mb-2">Section 1</h3>
          <p>Content for section 1</p>
        </div>
        <div className={contentBg}>
          <h3 className="font-semibold mb-2">Section 2</h3>
          <p>Content for section 2</p>
        </div>
      </div>
    </Container>
  </PageBg>
);
