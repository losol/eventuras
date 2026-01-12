import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Story, StoryHeader, StoryBody, StoryFooter } from './';
import { Heading } from '../../core/Heading';
import { Lead } from '../../core/Lead';
import { Text } from '../../core/Text';
import { Image } from '../../core/Image';
import { Button } from '../../core/Button';
import { Link } from '../../core/Link';

const meta: Meta<typeof Story> = {
  title: 'Blocks/Story',
  component: Story,
  tags: ['autodocs'],
  argTypes: {
    padding: { control: 'text' },
    margin: { control: 'text' },
    gap: { control: 'text' },
    backgroundColorClass: { control: 'text' },
  },
};

export default meta;
type StoryStory = StoryObj<typeof Story>;

export const BasicArticle: StoryStory = {
  args: {
    children: (
      <>
        <StoryHeader>
          <Heading as="h1">The Future of Web Development</Heading>
          <Lead>
            Explore the latest trends and technologies shaping how we build for
            the web in 2026 and beyond. From revolutionary frameworks to
            cutting-edge tooling, the landscape of web development continues to
            evolve at an unprecedented pace, offering developers more powerful
            and efficient ways to create exceptional user experiences.
          </Lead>
        </StoryHeader>
        <StoryBody>
          <Text>
            Web development has evolved dramatically over the past decade. From
            simple HTML pages to complex, interactive applications, the journey
            has been remarkable. What started as basic document sharing has
            transformed into a platform for building sophisticated applications
            that rival native desktop and mobile software in functionality and
            user experience.
          </Text>
          <Text>
            Modern frameworks like React, Vue, and Svelte have revolutionized
            how we think about building user interfaces. They've introduced
            concepts like component-based architecture, reactive state
            management, and efficient rendering. These innovations have not only
            made development faster but also more maintainable and scalable,
            allowing teams to build increasingly complex applications while
            keeping codebases manageable and understandable.
          </Text>
          <Text>
            The shift towards declarative programming paradigms has
            fundamentally changed how we approach UI development. Instead of
            manually manipulating the DOM, developers now describe what they
            want the interface to look like, and frameworks handle the complex
            task of keeping the UI in sync with application state.
          </Text>
          <Heading as="h2">Key Technologies</Heading>
          <Text>
            The ecosystem continues to grow with tools that make development
            faster and more enjoyable. TypeScript brings type safety, build
            tools like Vite provide instant feedback, and CSS frameworks like
            Tailwind enable rapid styling. Each of these technologies addresses
            specific pain points that developers have encountered over the years.
          </Text>
          <Heading as="h3">TypeScript: Type Safety for JavaScript</Heading>
          <Text>
            TypeScript has become the de facto standard for large-scale
            JavaScript applications. By adding static typing to JavaScript, it
            catches errors at compile time rather than runtime, significantly
            reducing bugs and improving developer confidence. The language's
            powerful type inference means you get many benefits without writing
            excessive type annotations, while its integration with modern IDEs
            provides exceptional autocomplete and refactoring capabilities.
          </Text>
          <Text>
            Beyond error prevention, TypeScript serves as living documentation
            for your code. Function signatures clearly communicate what
            parameters are expected and what will be returned, making APIs
            self-documenting and reducing the cognitive load when working with
            unfamiliar code.
          </Text>
          <Heading as="h3">Modern Build Tools</Heading>
          <Text>
            Tools like Vite and esbuild have revolutionized the development
            experience by providing near-instantaneous feedback. Gone are the
            days of waiting for bundlers to rebuild your entire application
            after every change. These next-generation build tools leverage
            native ES modules and efficient bundling strategies to deliver
            lightning-fast hot module replacement, making the development
            process feel more responsive and enjoyable.
          </Text>
          <Heading as="h2">The Rise of Server Components</Heading>
          <Text>
            One of the most significant recent innovations is the introduction
            of React Server Components. This paradigm shift allows developers to
            write components that run exclusively on the server, reducing the
            amount of JavaScript sent to the client and improving initial page
            load times. Server Components represent a fundamental rethinking of
            the client-server boundary in web applications.
          </Text>
          <Heading as="h3">Benefits of Server-First Rendering</Heading>
          <Text>
            By rendering components on the server, we can access databases and
            file systems directly without exposing sensitive credentials to the
            client. This not only improves security but also simplifies data
            fetching logic, as components can be async and await data directly
            rather than managing loading states and effects on the client side.
          </Text>
          <Text>
            Performance improvements are substantial: users receive rendered
            HTML immediately, and only the minimal JavaScript required for
            interactive elements needs to be downloaded and executed. This
            results in faster Time to Interactive (TTI) metrics and better
            experiences on slower devices and networks.
          </Text>
        </StoryBody>
      </>
    ),
  },
};

export const WithImage: StoryStory = {
  args: {
    children: (
      <>
        <StoryHeader>
          <Heading as="h1">Beautiful Mountain Landscapes</Heading>
          <Lead>
            Discover breathtaking views from the world's highest peaks and most
            scenic mountain ranges.
          </Lead>
        </StoryHeader>
        <StoryBody>
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop"
            alt="Mountain landscape"
            width={1200}
            height={600}
          />
          <Text>
            Mountains have captivated human imagination for millennia. Their
            majestic peaks, dramatic valleys, and serene beauty offer both
            challenge and solace to those who venture into their realm.
          </Text>
          <Heading as="h2">Alpine Adventures</Heading>
          <Text>
            From the Himalayas to the Alps, from the Rockies to the Andes,
            mountain ranges around the world provide endless opportunities for
            exploration, adventure, and contemplation.
          </Text>
        </StoryBody>
      </>
    ),
  },
};

export const WithFooter: StoryStory = {
  args: {
    children: (
      <>
        <StoryHeader>
          <Heading as="h1">Getting Started with React</Heading>
          <Lead>
            A comprehensive guide for beginners looking to learn React from
            scratch.
          </Lead>
        </StoryHeader>
        <StoryBody>
          <Text>
            React is a JavaScript library for building user interfaces. Created
            by Facebook, it has become one of the most popular choices for web
            development.
          </Text>
          <Heading as="h2">Why Choose React?</Heading>
          <Text>
            React's component-based architecture makes it easy to build and
            maintain large applications. Its virtual DOM ensures efficient
            updates, and the vast ecosystem provides solutions for almost any
            need.
          </Text>
          <Text>
            Whether you're building a simple website or a complex application,
            React provides the tools and patterns to help you succeed.
          </Text>
        </StoryBody>
        <StoryFooter>
          <Text>Published on January 12, 2026</Text>
          <Text>Last updated: January 12, 2026</Text>
        </StoryFooter>
      </>
    ),
  },
};

export const BlogPost: StoryStory = {
  args: {
    children: (
      <>
        <StoryHeader>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Technology • 12 min read
          </Text>
          <Heading as="h1">Building Accessible Web Applications</Heading>
          <Lead>
            Learn how to create inclusive digital experiences that work for
            everyone, regardless of their abilities or the devices they use.
            Accessibility is not just about compliance—it's about creating
            better products that serve a wider audience and provide superior
            user experiences for all.
          </Lead>
        </StoryHeader>
        <StoryBody>
          <Image
            src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=500&fit=crop"
            alt="Person using assistive technology"
            width={1200}
            height={500}
          />
          <Text>
            Accessibility is not just a feature—it's a fundamental aspect of web
            development that ensures your applications can be used by everyone.
            According to the World Health Organization, over 1 billion people
            worldwide experience some form of disability. By building accessible
            applications, we're not just meeting legal requirements or moral
            obligations; we're creating better products that benefit all users.
          </Text>
          <Text>
            The benefits of accessible design extend far beyond users with
            disabilities. Features like keyboard navigation help power users work
            more efficiently. Clear visual hierarchies and proper contrast ratios
            make content easier to read for everyone, especially in challenging
            lighting conditions. Captions on videos benefit users in noisy
            environments or those who prefer to read rather than listen.
          </Text>
          <Heading as="h2">Semantic HTML</Heading>
          <Text>
            Using semantic HTML elements like <code>header</code>,{' '}
            <code>nav</code>, <code>main</code>, and <code>article</code> helps
            screen readers understand the structure of your page. These elements
            provide meaning and context that assistive technologies can interpret
            to help users navigate your content more effectively.
          </Text>
          <Heading as="h3">Document Structure</Heading>
          <Text>
            Properly structured documents use heading levels (<code>h1</code>{' '}
            through <code>h6</code>) in a logical hierarchy. Screen reader users
            often navigate by headings, jumping from section to section to find
            the content they need. Skipping heading levels or using headings for
            visual styling rather than structural meaning can make navigation
            confusing and frustrating.
          </Text>
          <Text>
            Beyond headings, semantic elements like <code>section</code>,{' '}
            <code>article</code>, and <code>aside</code> help define the purpose
            of different page regions. This structural information allows users
            with assistive technologies to quickly understand the layout and find
            specific types of content.
          </Text>
          <Heading as="h3">Form Elements</Heading>
          <Text>
            Forms are particularly important to get right from an accessibility
            perspective. Every input should have an associated{' '}
            <code>label</code> element that clearly describes its purpose. Using
            the <code>for</code> attribute on labels and corresponding{' '}
            <code>id</code> on inputs creates programmatic associations that
            assistive technologies can understand.
          </Text>
          <Heading as="h2">ARIA Attributes</Heading>
          <Text>
            While semantic HTML is preferred, ARIA (Accessible Rich Internet
            Applications) attributes help make complex interactive components
            accessible when native HTML elements aren't sufficient. ARIA provides
            a way to make custom widgets like date pickers, tab panels, and
            autocomplete fields understandable to assistive technologies.
          </Text>
          <Heading as="h3">ARIA Roles</Heading>
          <Text>
            Roles define what an element is or does. For example,{' '}
            <code>role="navigation"</code> indicates a navigation landmark,{' '}
            <code>role="button"</code> identifies a clickable control. However,
            use roles sparingly—if a native HTML element exists that provides the
            same semantics, use that instead.
          </Text>
          <Heading as="h3">ARIA States and Properties</Heading>
          <Text>
            Attributes like <code>aria-expanded</code>,{' '}
            <code>aria-selected</code>, and <code>aria-label</code> provide
            additional information about the current state of elements. These
            must be kept in sync with the visual presentation of your
            application, which typically means updating them via JavaScript as
            user interactions occur.
          </Text>
          <Heading as="h2">Keyboard Navigation</Heading>
          <Text>
            Ensure all interactive elements can be reached and operated using
            only a keyboard. This is essential for users who cannot use a mouse,
            whether due to motor disabilities, visual impairments, or personal
            preference. The standard tab navigation should follow a logical order
            through your interface, and focus indicators should be clearly
            visible.
          </Text>
          <Heading as="h3">Focus Management</Heading>
          <Text>
            Managing focus properly is crucial, especially in single-page
            applications where content changes without full page reloads. When
            opening a modal dialog, focus should move to the dialog. When closing
            it, focus should return to the element that triggered it. Skip links
            allow keyboard users to bypass repetitive navigation and jump
            straight to main content.
          </Text>
          <Text>
            Custom keyboard shortcuts can enhance productivity, but they must be
            discoverable and avoid conflicts with assistive technology shortcuts.
            Document any custom shortcuts clearly and provide alternatives for
            users who can't or prefer not to use them.
          </Text>
          <Heading as="h2">Testing and Validation</Heading>
          <Text>
            Automated testing tools can catch many common accessibility issues,
            but they can't replace manual testing and testing with real users.
            Use tools like axe, WAVE, or Lighthouse to identify problems, then
            verify fixes by actually using your application with a keyboard and
            screen reader.
          </Text>
          <Heading as="h3">Screen Reader Testing</Heading>
          <Text>
            Test with multiple screen readers if possible, as they behave
            differently. NVDA and JAWS are popular on Windows, VoiceOver on macOS
            and iOS, and TalkBack on Android. Listen to how content is announced
            and whether the experience makes sense when you can't see the screen.
          </Text>
        </StoryBody>
        <StoryFooter>
          <div className="flex items-center gap-4">
            <Text>Written by Sarah Johnson</Text>
            <Text className="text-gray-600 dark:text-gray-400">•</Text>
            <Text>January 12, 2026</Text>
          </div>
        </StoryFooter>
      </>
    ),
  },
};

export const WithCallToAction: StoryStory = {
  args: {
    children: (
      <>
        <StoryHeader>
          <Heading as="h1">Join Our Developer Community</Heading>
          <Lead>
            Connect with thousands of developers, share knowledge, and grow your
            skills together.
          </Lead>
        </StoryHeader>
        <StoryBody>
          <Text>
            Our community is built on the principles of collaboration, mutual
            support, and continuous learning. Whether you're just starting out
            or you're a seasoned professional, there's a place for you here.
          </Text>
          <Heading as="h2">What You'll Get</Heading>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access to exclusive tutorials and courses</li>
            <li>Weekly coding challenges and hackathons</li>
            <li>Direct mentorship from industry experts</li>
            <li>Job opportunities from partner companies</li>
          </ul>
          <Text>
            Join thousands of developers who are already part of our thriving
            community. Start your journey today!
          </Text>
        </StoryBody>
        <StoryFooter>
          <div className="flex gap-4">
            <Button variant="primary">Join Now</Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </StoryFooter>
      </>
    ),
  },
};

export const NewsArticle: StoryStory = {
  args: {
    children: (
      <>
        <StoryHeader>
          <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            BREAKING NEWS
          </Text>
          <Heading as="h1">
            Major Update Released for Popular Framework
          </Heading>
          <Lead>
            The latest version introduces groundbreaking features that promise to
            change how developers build web applications.
          </Lead>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            January 12, 2026 at 09:30 AM PST
          </Text>
        </StoryHeader>
        <StoryBody>
          <Text>
            In a highly anticipated announcement today, the core team behind the
            popular web framework revealed version 5.0, packed with new features
            and performance improvements.
          </Text>
          <Heading as="h2">Key Features</Heading>
          <Text>
            The update includes a completely redesigned rendering engine that
            promises up to 40% faster initial page loads and improved runtime
            performance across the board.
          </Text>
          <Heading as="h2">Developer Response</Heading>
          <Text>
            Early adopters are already praising the update, with many reporting
            significant improvements in their development workflow and
            application performance.
          </Text>
        </StoryBody>
        <StoryFooter>
          <div className="flex flex-col gap-2">
            <Text className="font-semibold">Related Articles:</Text>
            <div className="flex flex-col gap-1">
              <Link href="#">Framework Comparison: What's Best in 2026?</Link>
              <Link href="#">
                Migration Guide: Upgrading to the Latest Version
              </Link>
              <Link href="#">Interview with the Core Development Team</Link>
            </div>
          </div>
        </StoryFooter>
      </>
    ),
  },
};

export const MinimalStory: StoryStory = {
  args: {
    children: (
      <StoryBody>
        <Heading as="h2">Simple Content Block</Heading>
        <Text>
          Sometimes you just need a simple container for your content without
          header or footer sections.
        </Text>
        <Text>
          The Story component is flexible enough to work with just the body, or
          any combination of header, body, and footer that suits your needs.
        </Text>
      </StoryBody>
    ),
  },
};

export const CustomSpacing: StoryStory = {
  args: {
    padding: '8',
    gap: '8',
    children: (
      <>
        <StoryHeader>
          <Heading as="h1">Custom Spacing Example</Heading>
          <Lead>
            This story demonstrates how you can customize padding and gap to
            create different layouts.
          </Lead>
        </StoryHeader>
        <StoryBody gap="6">
          <Text>
            The Story component accepts BoxProps, which means you can control
            padding, margin, gap, and other spacing properties.
          </Text>
          <Text>
            This example uses larger padding and gap values to create a more
            spacious layout.
          </Text>
        </StoryBody>
      </>
    ),
  },
};
