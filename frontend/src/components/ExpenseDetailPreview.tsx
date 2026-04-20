import React from 'react';

interface Expense {
  expenseType: string;
  amount: number;
  description: string;
  department: string;
}

interface ExpenseDetailPreviewProps {
  expenses: Expense[];
  totalExpenses: number;
}

export default function ExpenseDetailPreview({ expenses, totalExpenses }: ExpenseDetailPreviewProps) {
  if (!expenses || expenses.length === 0) return null;

  return (
    <div className="preview-container">
      <h3>Expense Detail Preview</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Expense Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, idx) => (
              <tr key={idx}>
                <td><strong>{expense.expenseType}</strong></td>
                <td>${expense.amount.toFixed(2)}</td>
                <td>{expense.description}</td>
                <td>{expense.department}</td>
              </tr>
            ))}
            <tr style={{ background: '#e3f2fd', fontWeight: 'bold' }}>
              <td colSpan={2}>TOTAL EXPENSES</td>
              <td colSpan={2} style={{ textAlign: 'right', paddingRight: '20px' }}>
                ${totalExpenses.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: '10px', color: '#999', fontSize: '0.9em' }}>
        Total: {expenses.length} expense items
      </p>
    </div>
  );
}
