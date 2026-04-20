import React from 'react';

interface SalesOrderPreviewProps {
  orders: any[];
}

export default function SalesOrderPreview({ orders }: SalesOrderPreviewProps) {
  if (!orders || orders.length === 0) return null;

  const preview = orders.slice(0, 10);
  const columns = Object.keys(preview[0] || {}).filter(
    (k) => k !== 'rowNumber' && k !== '__EMPTY' && preview[0][k] !== undefined
  );

  return (
    <div className="preview-container">
      <h3>Sales Order Preview</h3>
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
            {preview.map((order, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col}>
                    {typeof order[col] === 'number'
                      ? order[col].toLocaleString()
                      : order[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: '10px', color: '#999', fontSize: '0.9em' }}>
        Showing 1–{Math.min(10, orders.length)} of {orders.length} orders
      </p>
    </div>
  );
}
