import React from 'react';

interface InventoryItem {
  materialCode: string;
  description: string;
  purchaseQty: number;
  purchaseAmount: number;
  unitCost: number;
  unit: string;
  endingQty: number;
  endingAmount: number;
}

interface InventoryPreviewProps {
  inventoryDetails: InventoryItem[];
  totalPurchaseQty: number;
  totalEndingQty: number;
  totalPurchaseAmount: number;
  totalEndingAmount: number;
}

export default function InventoryPreview({
  inventoryDetails,
  totalPurchaseQty,
  totalEndingQty,
  totalPurchaseAmount,
  totalEndingAmount,
}: InventoryPreviewProps) {
  if (!inventoryDetails || inventoryDetails.length === 0) return null;

  const preview = inventoryDetails.slice(0, 10);

  return (
    <div className="preview-container">
      <h3>Inventory Detail Preview (First 10)</h3>

      <div style={{
        marginBottom: '15px',
        padding: '12px',
        borderRadius: '4px',
        backgroundColor: '#e8f5e9',
        border: '1px solid #4caf50',
        fontSize: '0.88em',
        lineHeight: '1.8',
      }}>
        <p style={{ margin: '0 0 6px', fontWeight: 'bold' }}>
          ✓ Inventory Summary
        </p>
        <p style={{ margin: 0 }}>
          <strong>Purchase Total Qty:</strong> {totalPurchaseQty?.toLocaleString()}
          &nbsp;|&nbsp;
          <strong>Ending Total Qty:</strong> {totalEndingQty?.toLocaleString()}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Purchase Amount:</strong> ${totalPurchaseAmount.toFixed(2)}
          &nbsp;|&nbsp;
          <strong>Ending Amount:</strong> ${totalEndingAmount.toFixed(2)}
        </p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Material Code</th>
              <th>Description</th>
              <th>Purchase Qty</th>
              <th>Purchase Amount</th>
              <th>Unit Cost</th>
              <th>Unit</th>
              <th>Ending Qty</th>
              <th>Ending Amount</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((inv, idx) => (
              <tr key={idx}>
                <td>{inv.materialCode}</td>
                <td>{inv.description}</td>
                <td>{inv.purchaseQty}</td>
                <td>${inv.purchaseAmount.toFixed(2)}</td>
                <td>${inv.unitCost.toFixed(2)}</td>
                <td>{inv.unit}</td>
                <td>{inv.endingQty}</td>
                <td>${inv.endingAmount.toFixed(2)}</td>
              </tr>
            ))}
            <tr style={{ background: '#e3f2fd', fontWeight: 'bold' }}>
              <td colSpan={2}>TOTAL</td>
              <td>{totalPurchaseQty}</td>
              <td>${totalPurchaseAmount.toFixed(2)}</td>
              <td></td>
              <td></td>
              <td>{totalEndingQty}</td>
              <td>${totalEndingAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: '10px', color: '#999', fontSize: '0.9em' }}>
        Showing 1–{Math.min(10, inventoryDetails.length)} of {inventoryDetails.length} items
      </p>
    </div>
  );
}
