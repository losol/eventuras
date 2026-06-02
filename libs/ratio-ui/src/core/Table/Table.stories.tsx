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

// Demonstrates colSpan/rowSpan support
export const WithSpannedCells: TableStory = () => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.HeadCell rowSpan={2}>Name</Table.HeadCell>
        <Table.HeadCell colSpan={2} className="text-center">
          Contact
        </Table.HeadCell>
        <Table.HeadCell rowSpan={2}>Role</Table.HeadCell>
      </Table.Row>
      <Table.Row>
        <Table.HeadCell>Email</Table.HeadCell>
        <Table.HeadCell>Phone</Table.HeadCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell>John Doe</Table.Cell>
        <Table.Cell>john@example.com</Table.Cell>
        <Table.Cell>+47 900 00 000</Table.Cell>
        <Table.Cell>Admin</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Jane Smith</Table.Cell>
        <Table.Cell colSpan={2}>jane@example.com (no phone on file)</Table.Cell>
        <Table.Cell>User</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);

// Demonstrates Foot + Caption + native row events. The Caption labels the
// table for assistive tech; the Foot holds a totals row; row-level onClick
// works because TableRow now forwards native <tr> attributes. Clickable
// rows pair onClick with role="button", tabIndex={0}, and an Enter/Space
// key handler so keyboard users can trigger the same action.
const triggerOnEnterOrSpace =
  (action: () => void) => (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

export const WithCaptionAndFoot: TableStory = () => {
  const logRow = (label: string) => () => console.log(`row: ${label}`);
  const clickableRowClasses =
    'cursor-pointer hover:bg-card-hover focus:outline-2 focus:outline-(--text-link)';

  return (
    <Table>
      <Table.Caption>Quarterly product sales — click a row for details</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.HeadCell scope="col">Product</Table.HeadCell>
          <Table.HeadCell scope="col">Units</Table.HeadCell>
          <Table.HeadCell scope="col">Revenue</Table.HeadCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row
          role="button"
          tabIndex={0}
          onClick={logRow('Widget A')}
          onKeyDown={triggerOnEnterOrSpace(logRow('Widget A'))}
          className={clickableRowClasses}
        >
          <Table.Cell>Widget A</Table.Cell>
          <Table.Cell>120</Table.Cell>
          <Table.Cell>$2,398.80</Table.Cell>
        </Table.Row>
        <Table.Row
          role="button"
          tabIndex={0}
          onClick={logRow('Widget B')}
          onKeyDown={triggerOnEnterOrSpace(logRow('Widget B'))}
          className={clickableRowClasses}
        >
          <Table.Cell>Widget B</Table.Cell>
          <Table.Cell>80</Table.Cell>
          <Table.Cell>$2,399.20</Table.Cell>
        </Table.Row>
      </Table.Body>
      <Table.Foot>
        <Table.Row>
          <Table.Cell className="font-semibold">Total</Table.Cell>
          <Table.Cell className="font-semibold">200</Table.Cell>
          <Table.Cell className="font-semibold">$4,798.00</Table.Cell>
        </Table.Row>
      </Table.Foot>
    </Table>
  );
};

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
