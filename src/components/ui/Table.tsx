import React from 'react';
import { cn } from '@/src/lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children, className, ...props }) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/5', className)} {...props}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            {headers.map((header) => (
              <th key={header} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {children}
        </tbody>
      </table>
    </div>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, onClick, ...props }) => {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-white/5',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => {
  return (
    <td className={cn('px-6 py-4 text-sm text-slate-300', className)} {...props}>
      {children}
    </td>
  );
};
