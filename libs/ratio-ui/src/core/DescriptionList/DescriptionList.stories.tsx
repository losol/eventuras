import { Meta, StoryFn } from '@storybook/react-vite';
import { DescriptionList, Item, Term, Definition } from './DescriptionList';

const meta: Meta<typeof DescriptionList> = {
  component: DescriptionList,
  tags: ['autodocs'],
};

export default meta;

type DescriptionListStory = StoryFn<typeof DescriptionList>;

export const Playground: DescriptionListStory = () => (
  <DescriptionList>
    <Item>
      <Term>Name</Term>
      <Definition>John Doe</Definition>
    </Item>
    <Item>
      <Term>Email</Term>
      <Definition>john@example.com</Definition>
    </Item>
    <Item>
      <Term>Role</Term>
      <Definition>Administrator</Definition>
    </Item>
  </DescriptionList>
);

export const UserProfile: DescriptionListStory = () => (
  <DescriptionList>
    <Item>
      <Term>Full Name</Term>
      <Definition>Jane Smith</Definition>
    </Item>
    <Item>
      <Term>Email Address</Term>
      <Definition>jane.smith@example.com</Definition>
    </Item>
    <Item>
      <Term>Phone Number</Term>
      <Definition>+47 123 45 678</Definition>
    </Item>
    <Item>
      <Term>Address</Term>
      <Definition>
        123 Main Street<br />
        Oslo, 0123<br />
        Norway
      </Definition>
    </Item>
    <Item>
      <Term>Member Since</Term>
      <Definition>January 2023</Definition>
    </Item>
  </DescriptionList>
);

export const ProductDetails: DescriptionListStory = () => (
  <DescriptionList>
    <Item>
      <Term>Product Name</Term>
      <Definition>Premium Widget</Definition>
    </Item>
    <Item>
      <Term>SKU</Term>
      <Definition>WDG-001-PREM</Definition>
    </Item>
    <Item>
      <Term>Price</Term>
      <Definition>$299.99</Definition>
    </Item>
    <Item>
      <Term>Stock Status</Term>
      <Definition>In Stock (42 units)</Definition>
    </Item>
    <Item>
      <Term>Description</Term>
      <Definition>
        This premium widget offers exceptional quality and performance for professional use.
      </Definition>
    </Item>
  </DescriptionList>
);
