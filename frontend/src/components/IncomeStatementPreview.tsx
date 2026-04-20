import React from 'react';

interface IncomeStatementPreviewProps {
  data: any;
}

export default function IncomeStatementPreview({ data }: IncomeStatementPreviewProps) {
  if (!data) return null;

  return (
    <div className="preview-container">
      <h3>Income Statement Preview</h3>
      <div className="table-container">
        <table>
          <tbody>
            <tr>
              <td><strong>Item</strong></td>
              <td><strong>Amount</strong></td>
            </tr>
            <tr>
              <td>Revenue</td>
              <td>${data.revenue?.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Cost of Goods Sold</td>
              <td>${data.cogs?.toFixed(2)}</td>
            </tr>
            <tr style={{ background: '#fffacd', fontWeight: 'bold' }}>
              <td>Gross Profit</td>
              <td>${(data.revenue - data.cogs)?.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Operating Expenses</td>
              <td>${data.expenses?.toFixed(2)}</td>
            </tr>
            <tr style={{ background: '#e6ffe6', fontWeight: 'bold' }}>
              <td>Net Profit</td>
              <td>${(data.revenue - data.cogs - data.expenses)?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
