import React from 'react';
import { ComparisonTable } from '../types';

interface ComparisonTableViewProps {
  tableData: ComparisonTable;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({ tableData }) => {
  if (!tableData || tableData.headers.length === 0 || tableData.rows.length === 0) {
    return (
       <div className="text-center py-10 text-neutral-500 animate-fade-scale-in">
        No comparison data was generated for this topic.
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden animate-fade-scale-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-neutral-800/50">
            <tr>
              {tableData.headers.map((header, index) => (
                <th key={index} className="p-4 px-6 font-semibold text-neutral-200 text-sm tracking-wider uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {tableData.rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="opacity-0 animate-fade-scale-in"
                style={{ animationDelay: `${rowIndex * 100}ms` }}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-4 px-6 text-neutral-300 align-top">
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