import { Flex } from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from 'components/inputs';
import { Text } from 'components/typography';

type DataTableProps = {
  columns: any[];
  data: any[];
  handlePageClick?: (page: number) => void;
  totalPages?: number;
  page?: number;
};

const DataTable = (props: DataTableProps) => {
  const { columns, data, handlePageClick, totalPages, page } = props;

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {
        // only show page navigation if handlePageClick is provided
        typeof page === 'number' &&
        typeof totalPages === 'number' &&
        handlePageClick &&
        typeof handlePageClick === 'function' ? (
          <Flex m={4}>
            <Flex>
              <Button
                ariaLabel="First page"
                onClick={() => handlePageClick(1)}
                disabled={page === 1}
                leftIcon={<IconArrowLeft />}
              />
              <Button
                aria-label="Previous page"
                onClick={() => handlePageClick(page - 1)}
                disabled={page - 1 <= 0}
                leftIcon={<IconChevronsLeft />}
              />
            </Flex>

            <Flex>
              <Text>
                Page{' '}
                <Text fontWeight={700} as="span">
                  {page}
                </Text>{' '}
                of{' '}
                <Text fontWeight={700} as="span">
                  {totalPages}
                </Text>
              </Text>
            </Flex>

            <Flex>
              <Button
                aria-label="Next Page"
                onClick={() => handlePageClick(page + 1)}
                disabled={page + 1 > totalPages}
                leftIcon={<IconChevronsRight />}
              />
              <Button
                aria-label="Last page"
                onClick={() => handlePageClick(totalPages)}
                disabled={page === totalPages}
                leftIcon={<IconArrowRight />}
              />
            </Flex>
          </Flex>
        ) : null
      }
    </>
  );
};

export default DataTable;
