import { Meta, StoryFn } from '@storybook/react-vite';
import { DescriptionList } from './DescriptionList';

const meta: Meta<typeof DescriptionList> = {
  component: DescriptionList,
  tags: ['autodocs'],
};

export default meta;

type DescriptionListStory = StoryFn<typeof DescriptionList>;

export const Playground: DescriptionListStory = () => (
  <DescriptionList>
    <DescriptionList.Item>
      <DescriptionList.Term>Name</DescriptionList.Term>
      <DescriptionList.Definition>John Doe</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Email</DescriptionList.Term>
      <DescriptionList.Definition>john@example.com</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Role</DescriptionList.Term>
      <DescriptionList.Definition>Administrator</DescriptionList.Definition>
    </DescriptionList.Item>
  </DescriptionList>
);

export const UserProfile: DescriptionListStory = () => (
  <DescriptionList>
    <DescriptionList.Item>
      <DescriptionList.Term>Full Name</DescriptionList.Term>
      <DescriptionList.Definition>Jane Smith</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Email Address</DescriptionList.Term>
      <DescriptionList.Definition>jane.smith@example.com</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Phone Number</DescriptionList.Term>
      <DescriptionList.Definition>+47 123 45 678</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Address</DescriptionList.Term>
      <DescriptionList.Definition>
        123 Main Street<br />
        Oslo, 0123<br />
        Norway
      </DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Member Since</DescriptionList.Term>
      <DescriptionList.Definition>January 2023</DescriptionList.Definition>
    </DescriptionList.Item>
  </DescriptionList>
);

export const ProductDetails: DescriptionListStory = () => (
  <DescriptionList>
    <DescriptionList.Item>
      <DescriptionList.Term>Product Name</DescriptionList.Term>
      <DescriptionList.Definition>Premium Widget</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>SKU</DescriptionList.Term>
      <DescriptionList.Definition>WDG-001-PREM</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Price</DescriptionList.Term>
      <DescriptionList.Definition>$299.99</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Stock Status</DescriptionList.Term>
      <DescriptionList.Definition>In Stock (42 units)</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Description</DescriptionList.Term>
      <DescriptionList.Definition>
        This premium widget offers exceptional quality and performance for professional use.
      </DescriptionList.Definition>
    </DescriptionList.Item>
  </DescriptionList>
);
