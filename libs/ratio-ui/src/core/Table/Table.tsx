import React from 'react';

type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  children: React.ReactNode;
};

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  children: React.ReactNode;
};

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  children: React.ReactNode;
};

type TableFootProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  children: React.ReactNode;
};

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  children: React.ReactNode;
};

type TableHeadCellProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  children: React.ReactNode;
};

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children: React.ReactNode;
};

type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement> & {
  children: React.ReactNode;
};

/**
 * Table component with styled defaults
 */
export const Table: React.FC<TableProps> & {
  Header: React.FC<TableHeaderProps>;
  Body: React.FC<TableBodyProps>;
  Foot: React.FC<TableFootProps>;
  Row: React.FC<TableRowProps>;
  HeadCell: React.FC<TableHeadCellProps>;
  Cell: React.FC<TableCellProps>;
  Caption: React.FC<TableCaptionProps>;
} = ({ children, className = '', ...rest }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full border-collapse ${className}`} {...rest}>
        {children}
      </table>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '', ...rest }) => {
  return (
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
};

const TableBody: React.FC<TableBodyProps> = ({ children, className = '', ...rest }) => {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
};

const TableFoot: React.FC<TableFootProps> = ({ children, className = '', ...rest }) => {
  return (
    <tfoot className={className} {...rest}>
      {children}
    </tfoot>
  );
};

const TableRow: React.FC<TableRowProps> = ({ children, className = '', ...rest }) => {
  return (
    <tr className={`border-b border-border-1 ${className}`} {...rest}>
      {children}
    </tr>
  );
};

const TableHeadCell: React.FC<TableHeadCellProps> = ({ children, className = '', ...rest }) => {
  return (
    <th
      className={`px-4 py-3 text-left text-sm font-semibold text-(--text) bg-card-hover ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
};

const TableCell: React.FC<TableCellProps> = ({ children, className = '', ...rest }) => {
  return (
    <td className={`px-4 py-3 text-sm text-(--text-muted) ${className}`} {...rest}>
      {children}
    </td>
  );
};

// `<caption>` is a child of `<table>`, not the wrapper `<div>` — but the
// styled root mounts a wrapper div, so consumers compose `<Table.Caption>`
// as the first child inside `<Table>` and the browser anchors it to the
// containing table element via DOM ordering.
const TableCaption: React.FC<TableCaptionProps> = ({ children, className = '', ...rest }) => {
  return (
    <caption className={`px-4 py-2 text-sm text-(--text-muted) text-left ${className}`} {...rest}>
      {children}
    </caption>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Foot = TableFoot;
Table.Row = TableRow;
Table.HeadCell = TableHeadCell;
Table.Cell = TableCell;
Table.Caption = TableCaption;
