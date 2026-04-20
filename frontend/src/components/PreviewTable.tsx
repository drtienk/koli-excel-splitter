import React from 'react';

interface PreviewTableProps {
  title: string;
  columns: string[];
  data: any[];
}

export default function PreviewTable({ title, columns, data }: PreviewTableProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="preview-container">
      <h3>{title}</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
