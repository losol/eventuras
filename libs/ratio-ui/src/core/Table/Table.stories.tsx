import { Meta, StoryFn } from '@storybook/react-vite';
import { Table } from './Table';

const meta: Meta<typeof Table> = {
  component: Table,
  tags: ['autodocs'],
};

export default meta;

type TableStory = StoryFn<typeof Table>;

export const Playground: TableStory = () => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Email</Table.HeadCell>
        <Table.HeadCell>Role</Table.HeadCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell>John Doe</Table.Cell>
        <Table.Cell>john@example.com</Table.Cell>
        <Table.Cell>Admin</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Jane Smith</Table.Cell>
        <Table.Cell>jane@example.com</Table.Cell>
        <Table.Cell>User</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);

export const WithManyColumns: TableStory = () => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.HeadCell>ID</Table.HeadCell>
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Email</Table.HeadCell>
        <Table.HeadCell>Role</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell>1</Table.Cell>
        <Table.Cell>John Doe</Table.Cell>
        <Table.Cell>john@example.com</Table.Cell>
        <Table.Cell>Admin</Table.Cell>
        <Table.Cell>Active</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>2</Table.Cell>
        <Table.Cell>Jane Smith</Table.Cell>
        <Table.Cell>jane@example.com</Table.Cell>
        <Table.Cell>User</Table.Cell>
        <Table.Cell>Active</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>3</Table.Cell>
        <Table.Cell>Bob Johnson</Table.Cell>
        <Table.Cell>bob@example.com</Table.Cell>
        <Table.Cell>User</Table.Cell>
        <Table.Cell>Inactive</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);

export const WithCustomStyling: TableStory = () => (
  <Table className="bg-gray-50">
    <Table.Header>
      <Table.Row className="bg-blue-100">
        <Table.HeadCell className="font-bold">Product</Table.HeadCell>
        <Table.HeadCell className="font-bold">Price</Table.HeadCell>
        <Table.HeadCell className="font-bold">Stock</Table.HeadCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row className="hover:bg-blue-50">
        <Table.Cell>Widget A</Table.Cell>
        <Table.Cell>$19.99</Table.Cell>
        <Table.Cell>In Stock</Table.Cell>
      </Table.Row>
      <Table.Row className="hover:bg-blue-50">
        <Table.Cell>Widget B</Table.Cell>
        <Table.Cell>$29.99</Table.Cell>
        <Table.Cell>Out of Stock</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);
