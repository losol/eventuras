import { Center, Table } from '@mantine/core';
import { Flex } from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react';
import { Button } from 'components/inputs';
import { Text } from 'components/typography';
import { usePagination, useTable } from 'react-table';

type ColumnType = {
  Header: string;
  accessor: string;
};

type DataTableProps = {
  columns: ColumnType[];
  data: any[];
  handlePageClick?: (page: number) => void;
  totalPages?: number;
  page?: number;
};

const DataTable = (props: DataTableProps) => {
  const { columns, data, handlePageClick, totalPages, page } = props;

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } = useTable(
    {
      columns,
      data,
      initialState: {
        // pageIndex: 0, // TODO: Update react-table to v8. Use similar option ot another way
      },
    },
    usePagination
  );

  return (
    <>
      <Table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            /* eslint-disable react/jsx-key */
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
            /* eslint-enable react/jsx-key */
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              /* eslint-disable react/jsx-key */
              <tr {...row.getRowProps()}>
                {
                  /* eslint-disable react/jsx-key */
                  row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  })
                }
              </tr>
              /* eslint-enable react/jsx-key */
            );
          })}
        </tbody>
      </Table>

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

            <Flex align={Center}>
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
