import { Meta, StoryFn } from '@storybook/react-vite';
import { Footer, Publisher } from './Footer';

const meta: Meta<typeof Footer> = {
  component: Footer,
  tags: ['autodocs'],
};

export default meta;

type FooterStory = StoryFn<typeof Footer>;

const samplePublisher: Publisher = {
  name: 'Example Organization',
  address: '123 Main Street, Oslo',
  phone: '+47 123 45 678',
  email: 'contact@example.com',
  organizationNumber: '123456789',
};

/**
 * The plain `<Footer>` is a thin shell — the `<footer>` element with the
 * standard background, padding, and a `Container` wrapper. Compose your
 * own layout inside.
 */
export const Shell: FooterStory = () => (
  <Footer>
    <p>Compose anything you want inside the shell.</p>
  </Footer>
);

/**
 * `dark` flips the surface tone, so plain text and any descendants that
 * read `var(--text)` switch to the light value.
 */
export const DarkShell: FooterStory = () => (
  <Footer dark className="bg-slate-900">
    <p>Plain text inside the dark footer inherits the light surface tone.</p>
  </Footer>
);

/**
 * `Footer.Classic` is the pre-2.0 fixed layout — siteTitle and an
 * optional publisher block on the left, children on the right via
 * `md:flex md:justify-between`. Kept for backward compatibility.
 */
export const Classic: FooterStory = () => (
  <Footer.Classic siteTitle="Eventuras" publisher={samplePublisher} />
);

export const ClassicWithChildren: FooterStory = () => (
  <Footer.Classic siteTitle="Eventuras" publisher={samplePublisher}>
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      <div>
        <h3 className="mb-2 font-semibold">Resources</h3>
        <ul className="space-y-1">
          <li><a href="/docs" className="hover:underline">Documentation</a></li>
          <li><a href="/api" className="hover:underline">API</a></li>
          <li><a href="/support" className="hover:underline">Support</a></li>
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Company</h3>
        <ul className="space-y-1">
          <li><a href="/about" className="hover:underline">About</a></li>
          <li><a href="/contact" className="hover:underline">Contact</a></li>
          <li><a href="/privacy" className="hover:underline">Privacy</a></li>
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Legal</h3>
        <ul className="space-y-1">
          <li><a href="/terms" className="hover:underline">Terms</a></li>
          <li><a href="/privacy-policy" className="hover:underline">Privacy Policy</a></li>
          <li><a href="/cookie-policy" className="hover:underline">Cookie Policy</a></li>
        </ul>
      </div>
    </div>
  </Footer.Classic>
);

export const ClassicMinimal: FooterStory = () => (
  <Footer.Classic siteTitle="Simple Site" publisher={samplePublisher} />
);
