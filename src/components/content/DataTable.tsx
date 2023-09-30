'use client';

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
import React, { useEffect } from 'react';

import { Text } from '@/components/content';
import { Button } from '@/components/inputs';

type DataTableProps = {
  columns: any[];
  data: any[];
  handlePageClick?: (page: number) => void;
  totalPages?: number;
  page?: number;
  clientsidePagination?: boolean;
  clientsidePaginationPageSize?: number;
};

const DataTable = (props: DataTableProps) => {
  const {
    columns,
    data,
    handlePageClick,
    totalPages,
    page,
    clientsidePagination,
    clientsidePaginationPageSize = 25,
  } = props;

  const handleClientPageChange = (newPage: number) => {
    table.setPageIndex(newPage);
  };

  const table = useReactTable({
    columns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    if (clientsidePagination) table.setPageSize(clientsidePaginationPageSize);
  }, []);

  return (
    <>
      <table className="table-auto w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="text-left">
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
            <tr key={row.id} className="even:bg-gray-50 odd:bg-white text-black">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {clientsidePagination && table.getPageCount() > 1 ? (
        <Text classname="flex bg-slate-50 py-2 px-5">
          <Button
            aria-label="Previous Page"
            onClick={() => handleClientPageChange(table.getState().pagination.pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
            leftIcon={<IconChevronsLeft />}
            className="flex-col"
          />
          <Text classname="flex-col">
            Page <Text as="span">{table.getState().pagination.pageIndex + 1}</Text> of{' '}
            <Text as="span">{table.getPageCount()}</Text>
          </Text>
          <Button
            aria-label="Next Page"
            onClick={() => handleClientPageChange(table.getState().pagination.pageIndex + 1)}
            disabled={!table.getCanNextPage()}
            leftIcon={<IconChevronsRight />}
            className="flex-col"
          />
        </Text>
      ) : null}

      {
        // Server side pagination needs some work...
        !clientsidePagination && handlePageClick && page && totalPages ? (
          <Text>
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
            <Text>
              Page <Text as="span">{page}</Text> of <Text as="span">{totalPages}</Text>
            </Text>
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
          </Text>
        ) : null
      }
    </>
  );
};

export default DataTable;
export { createColumnHelper } from '@tanstack/react-table';
