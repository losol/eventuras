import React from 'react';

type TableProps = {
  children: React.ReactNode;
  className?: string;
};

type TableHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

type TableBodyProps = {
  children: React.ReactNode;
  className?: string;
};

type TableRowProps = {
  children: React.ReactNode;
  className?: string;
};

type TableHeadCellProps = {
  children: React.ReactNode;
  className?: string;
};

type TableCellProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Table component with styled defaults
 */
export const Table: React.FC<TableProps> & {
  Header: React.FC<TableHeaderProps>;
  Body: React.FC<TableBodyProps>;
  Row: React.FC<TableRowProps>;
  HeadCell: React.FC<TableHeadCellProps>;
  Cell: React.FC<TableCellProps>;
} = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full border-collapse ${className}`}>{children}</table>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return <thead className={className}>{children}</thead>;
};

const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return <tbody className={className}>{children}</tbody>;
};

const TableRow: React.FC<TableRowProps> = ({ children, className = '' }) => {
  return <tr className={`border-b ${className}`}>{children}</tr>;
};

const TableHeadCell: React.FC<TableHeadCellProps> = ({ children, className = '' }) => {
  return (
    <th
      className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50 ${className}`}
    >
      {children}
    </th>
  );
};

const TableCell: React.FC<TableCellProps> = ({ children, className = '' }) => {
  return <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>;
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.HeadCell = TableHeadCell;
Table.Cell = TableCell;
