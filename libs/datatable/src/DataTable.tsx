'use client';
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';
import {
  ColumnFilter,
  ColumnFiltersState,
  ExpandedState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Row,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect } from 'react';
import React from 'react';
import { DebouncedInput } from '@eventuras/ratio-ui/forms';
;
type DataTableProps = {
  columns: any[];
  data: any[];
  pageSize?: number;
  clientsidePagination?: boolean;
  state?: Partial<TableState>;
  enableGlobalSearch?: boolean;
  columnFilters?: ColumnFilter[];
  renderToolbar?: (searchInput: React.ReactNode) => React.ReactNode;
  renderSubComponent?: (props: { row: Row<any> }) => React.ReactElement;
  getRowCanExpand?: (row: Row<any>) => boolean;
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
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const handleClientPageChange = (newPage: number) => {
    table.setPageIndex(newPage);
  };

  useEffect(() => {
    if (props.columnFilters) {
      setColumnFilters(props.columnFilters);
    }
  }, [props.columnFilters]);

  const table = useReactTable({
    columns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getFilteredRowModel: getFilteredRowModel(),
    getRowCanExpand: props.getRowCanExpand,
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
      columnFilters,
      expanded,
    },
  });
  useEffect(() => {
    if (clientsidePagination) table.setPageSize(pageSize);
  }, []);

  const searchInput = props.enableGlobalSearch ? (
    <DebouncedInput
      value={globalFilter ?? ''}
      onChange={value => setGlobalFilter(String(value))}
      placeholder="Search all columns..."
      className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-80"
    />
  ) : null;

  return (
    <>
      {props.renderToolbar ? (
        props.renderToolbar(searchInput)
      ) : (
        searchInput
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
            <React.Fragment key={row.id ?? row.index}>
              <tr
                className="even:bg-gray-50 odd:bg-white dark:even:bg-slate-950 dark:odd:bg-slate-900 text-black dark:text-white"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {row.getIsExpanded() && props.renderSubComponent && (
                <tr className="bg-gray-100 dark:bg-slate-800">
                  <td colSpan={row.getVisibleCells().length} className="p-4">
                    {props.renderSubComponent({ row })}
                  </td>
                </tr>
              )}
            </React.Fragment>
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
export type { ColumnFilter, ColumnSort, TableState } from '@tanstack/react-table';
export { createColumnHelper } from '@tanstack/react-table';
