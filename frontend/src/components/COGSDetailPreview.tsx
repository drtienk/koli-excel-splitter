import React from 'react';

interface COGSDetail {
  productCode: string;
  description: string;
  quantity: number;
  unitCost: number;
  lineCOGS: number;
}

interface COGSDetailPreviewProps {
  cogsDetails: COGSDetail[];
  totalCOGS: number;
  totalQuantity?: number;
  salesOrderTotalQty?: number;
  quantityMatches?: boolean;
  quantityDifference?: number;
}

export default function COGSDetailPreview({
  cogsDetails,
  totalCOGS,
  totalQuantity,
  salesOrderTotalQty,
  quantityMatches,
  quantityDifference,
}: COGSDetailPreviewProps) {
  if (!cogsDetails || cogsDetails.length === 0) return null;

  const preview = cogsDetails.slice(0, 10);

  return (
    <div className="preview-container">
      <h3>COGS Detail Preview (First 10)</h3>

      <div style={{
        marginBottom: '15px',
        padding: '12px',
        borderRadius: '4px',
        backgroundColor: quantityMatches ? '#e8f5e9' : '#fff3e0',
        border: `1px solid ${quantityMatches ? '#4caf50' : '#ff9800'}`,
        fontSize: '0.88em',
        lineHeight: '1.8',
      }}>
        <p style={{ margin: '0 0 6px', fontWeight: 'bold' }}>
          {quantityMatches ? '✓ Quantity Verified' : '⚠ Quantity Mismatch'}
        </p>
        <p style={{ margin: 0 }}>
          <strong>COGS Total Quantity:</strong> {totalQuantity?.toLocaleString()}
          &nbsp;|&nbsp;
          <strong>Sales Order Total Qty:</strong> {salesOrderTotalQty?.toLocaleString()}
          {!quantityMatches && (
            <span style={{ color: '#e65100', marginLeft: 8 }}>
              (diff: {quantityDifference?.toLocaleString()})
            </span>
          )}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Total COGS:</strong> ${totalCOGS.toFixed(2)}
          <span style={{ color: '#666', marginLeft: 8, fontSize: '0.85em' }}>
            (from Purchased Material and WIP)
          </span>
        </p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Amount (COGS)</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((cogs, idx) => (
              <tr key={idx}>
                <td>{cogs.productCode}</td>
                <td>{cogs.description}</td>
                <td>{cogs.quantity}</td>
                <td>${cogs.unitCost.toFixed(2)}</td>
                <td>${cogs.lineCOGS.toFixed(2)}</td>
              </tr>
            ))}
            <tr style={{ background: '#e3f2fd', fontWeight: 'bold' }}>
              <td colSpan={4}>TOTAL COGS</td>
              <td>${totalCOGS.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: '10px', color: '#999', fontSize: '0.9em' }}>
        Showing 1–{Math.min(10, cogsDetails.length)} of {cogsDetails.length} items
      </p>
    </div>
  );
}
