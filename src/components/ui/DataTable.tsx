'use client';

import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect } from 'react';
import React from 'react';

import { DebouncedInput } from '../forms/Input';
import Pagination from './Pagination';

type DataTableProps = {
  columns: any[];
  data: any[];
  pageSize?: number;
  clientsidePagination?: boolean;
  state?: Partial<TableState>;
  enableGlobalSearch?: boolean;
};

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);
  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const DataTable = (props: DataTableProps) => {
  const { columns, data, clientsidePagination, pageSize = 25, state } = props;
  const [globalFilter, setGlobalFilter] = React.useState('');
  const handleClientPageChange = (newPage: number) => {
    table.setPageIndex(newPage);
  };

  const table = useReactTable({
    columns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      ...state,
      globalFilter,
    },
  });

  useEffect(() => {
    if (clientsidePagination) table.setPageSize(pageSize);
  }, []);

  return (
    <>
      {props.enableGlobalSearch && (
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          className="p-2 font-lg shadow border border-block"
          placeholder="Search all columns..."
        />
      )}
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
export type { ColumnSort, TableState } from '@tanstack/react-table';
export { createColumnHelper } from '@tanstack/react-table';
