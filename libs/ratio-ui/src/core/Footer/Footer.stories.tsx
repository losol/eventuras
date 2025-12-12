import { Meta, StoryFn } from '@storybook/react-vite';
import { Footer, Publisher } from './Footer';

const meta: Meta<typeof Footer> = {
  component: Footer,
  tags: ['autodocs'],
};

export default meta;

type FooterStory = StoryFn<typeof Footer>;

export const Playground: FooterStory = args => <Footer {...args} />;

export const Basic: FooterStory = () => <Footer siteTitle="Eventuras" />;

export const WithPublisher: FooterStory = () => {
  const publisher: Publisher = {
    name: 'Example Organization',
    address: '123 Main Street, Oslo',
    phone: '+47 123 45 678',
    email: 'contact@example.com',
    organizationNumber: '123456789',
  };

  return <Footer siteTitle="Eventuras" publisher={publisher} />;
};

export const WithChildren: FooterStory = () => (
  <Footer siteTitle="Eventuras">
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      <div>
        <h3 className="mb-2 font-semibold">Resources</h3>
        <ul className="space-y-1">
          <li>
            <a href="#" className="hover:underline">
              Documentation
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              API
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Support
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Company</h3>
        <ul className="space-y-1">
          <li>
            <a href="#" className="hover:underline">
              About
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Privacy
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Legal</h3>
        <ul className="space-y-1">
          <li>
            <a href="#" className="hover:underline">
              Terms
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Cookie Policy
            </a>
          </li>
        </ul>
      </div>
    </div>
  </Footer>
);

export const Complete: FooterStory = () => {
  const publisher: Publisher = {
    name: 'Eventuras AS',
    address: 'Karl Johans gate 1, 0154 Oslo',
    phone: '+47 22 33 44 55',
    email: 'post@eventuras.com',
    organizationNumber: '987654321',
  };

  return (
    <Footer siteTitle="Eventuras" publisher={publisher}>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div>
          <h3 className="mb-2 font-semibold dark:text-white">Events</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>
              <a href="#" className="hover:underline">
                Upcoming Events
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Past Events
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Create Event
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold dark:text-white">Resources</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>
              <a href="#" className="hover:underline">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                API
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Support
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold dark:text-white">Company</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>
              <a href="#" className="hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Careers
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold dark:text-white">Legal</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>
              <a href="#" className="hover:underline">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Footer>
  );
};

export const MinimalWithPublisher: FooterStory = () => {
  const publisher: Publisher = {
    name: 'Simple Company',
    address: 'Oslo, Norway',
    phone: '+47 123 45 678',
    email: 'hello@simple.com',
  };

  return <Footer siteTitle="Simple Site" publisher={publisher} />;
};
