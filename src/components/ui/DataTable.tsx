'use client';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect } from 'react';

import Pagination from './Pagination';

type DataTableProps = {
  columns: any[];
  data: any[];
  pageSize?: number;
  clientsidePagination?: boolean;
};

const DataTable = (props: DataTableProps) => {
  const { columns, data, clientsidePagination, pageSize = 25 } = props;

  const handleClientPageChange = (newPage: number) => {
    table.setPageIndex(newPage);
  };

  const table = useReactTable({
    columns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  useEffect(() => {
    if (clientsidePagination) table.setPageSize(pageSize);
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
            <tr
              key={row.id}
              className="even:bg-gray-50 odd:bg-white dark:even:bg-slate-950 dark:odd:bg-slate-900 text-black dark:text-white"
            >
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
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPreviousPageClick={() =>
            handleClientPageChange(table.getState().pagination.pageIndex - 1)
          }
          onNextPageClick={() => handleClientPageChange(table.getState().pagination.pageIndex + 1)}
        />
      ) : null}
    </>
  );
};

export default DataTable;
export { createColumnHelper } from '@tanstack/react-table';
