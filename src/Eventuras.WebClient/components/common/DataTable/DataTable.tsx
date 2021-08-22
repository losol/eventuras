import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import {
  Flex,
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { usePagination, useTable } from 'react-table';

export default function DataTable({
  columns,
  data,
  handlePageClick = null,
  totalPages = null,
  page = null,
}) {
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
    useTable(
      {
        columns,
        data,
        initialState: {
          pageIndex: 0,
        },
      },
      usePagination
    );

  return (
    <>
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            /* eslint-disable react/jsx-key */
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th {...column.getHeaderProps()}>{column.render('Header')}</Th>
              ))}
            </Tr>
            /* eslint-enable react/jsx-key */
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              /* eslint-disable react/jsx-key */
              <Tr {...row.getRowProps()}>
                {
                  /* eslint-disable react/jsx-key */
                  row.cells.map((cell) => {
                    return (
                      <Td {...cell.getCellProps()}>{cell.render('Cell')}</Td>
                    );
                  })
                }
              </Tr>
              /* eslint-enable react/jsx-key */
            );
          })}
        </Tbody>
      </Table>

      {
        // only show page navigation if handlePageClick is provided
        handlePageClick && (
          <Flex justifyContent="space-between" m={4} alignItems="center">
            <Flex>
              <IconButton
                aria-label="First page"
                onClick={() => handlePageClick(1)}
                isDisabled={page === 1}
                icon={<ArrowLeftIcon h={3} w={3} />}
                mr={4}
              />
              <IconButton
                aria-label="Previous page"
                onClick={() => handlePageClick(page - 1)}
                isDisabled={page - 1 <= 0}
                icon={<ChevronLeftIcon h={6} w={6} />}
              />
            </Flex>

            <Flex alignItems="center">
              <Text flexShrink={0} mr={8}>
                Page{' '}
                <Text fontWeight="bold" as="span">
                  {page}
                </Text>{' '}
                of{' '}
                <Text fontWeight="bold" as="span">
                  {totalPages}
                </Text>
              </Text>
            </Flex>

            <Flex>
              <IconButton
                aria-label="Next Page"
                onClick={() => handlePageClick(page + 1)}
                isDisabled={page + 1 > totalPages}
                icon={<ChevronRightIcon h={6} w={6} />}
              />
              <IconButton
                aria-label="Last page"
                onClick={() => handlePageClick(totalPages)}
                isDisabled={page === totalPages}
                icon={<ArrowRightIcon h={3} w={3} />}
                ml={4}
              />
            </Flex>
          </Flex>
        )
      }
    </>
  );
}
