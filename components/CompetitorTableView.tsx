import React from 'react';
import { ComparisonTable } from '../types';

interface CompetitorTableViewProps {
  tableData: ComparisonTable;
}

export const CompetitorTableView: React.FC<CompetitorTableViewProps> = ({ tableData }) => {
  if (!tableData || tableData.headers.length === 0 || tableData.rows.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-neutral-900/40 rockstar:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800/80 rockstar:border-neutral-800/80 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50">
            <tr>
              {tableData.headers.map((header, index) => (
                <th key={index} className="p-4 px-6 font-semibold text-neutral-600 dark:text-neutral-200 text-sm tracking-wider uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80 rockstar:divide-neutral-800/80">
            {tableData.rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 rockstar:hover:bg-neutral-800/40 transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-4 px-6 text-neutral-700 dark:text-neutral-300 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};