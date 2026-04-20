import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import PreviewTable from './components/PreviewTable';
import IncomeStatementPreview from './components/IncomeStatementPreview';
import SalesOrderPreview from './components/SalesOrderPreview';
import ValidationReport from './components/ValidationReport';
import ExpenseDetailPreview from './components/ExpenseDetailPreview';
import COGSDetailPreview from './components/COGSDetailPreview';
import ActivityDriverPreview from './components/ActivityDriverPreview';
import InventoryPreview from './components/InventoryPreview';
import MergeUpload from './components/MergeUpload';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://koli-excel-splitter-production.up.railway.app';

type Tab = 'split' | 'merge';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('split');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [splitResult, setSplitResult] = useState<any>(null);
  const [expenseResult, setExpenseResult] = useState<any>(null);
  const [cogsResult, setCogsResult] = useState<any>(null);
  const [activityDriverResult, setActivityDriverResult] = useState<any>(null);
  const [inventoryResult, setInventoryResult] = useState<any>(null);
  const [mergeResult, setMergeResult] = useState<any>(null);
  const [company, setCompany] = useState<string>('KOLI');
  const [period, setPeriod] = useState<string>('2024-01');

  const handleSplitComplete = (result: any) => {
    setSplitResult(result);
    if (result.company) setCompany(result.company);
    if (result.period) setPeriod(result.period);
    if (result.expenseResult) {
      setExpenseResult(result.expenseResult);
    }
    if (result.cogsResult) {
      setCogsResult(result.cogsResult);
    }
    if (result.activityDriverResult) {
      setActivityDriverResult(result.activityDriverResult);
    }
    if (result.inventoryResult) {
      setInventoryResult(result.inventoryResult);
    }
  };

  const handleExpenseComplete = (result: any) => {
    setExpenseResult(result);
  };

  const handleMergeComplete = (result: any) => {
    setMergeResult(result);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>KOLI Excel Splitter</h1>
        <p>Split and merge KOLI Excel files with intelligent calculations and validation</p>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'split' ? 'active' : ''}`}
          onClick={() => setActiveTab('split')}
        >
          Split File
        </button>
        <button
          className={`tab-btn ${activeTab === 'merge' ? 'active' : ''}`}
          onClick={() => setActiveTab('merge')}
        >
          Merge Files
        </button>
      </div>

      <div className="container">
        {activeTab === 'split' ? (
          <div className="split-section">
            <div className="section-left">
              <FileUpload onSplitComplete={handleSplitComplete} onExpenseComplete={handleExpenseComplete} />
            </div>

            {splitResult && (
              <div className="section-right">
                <ValidationReport validation={splitResult.validation} />

                <div className="metadata-box" style={{ marginBottom: '15px' }}>
                  <h3>File Metadata</h3>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Company:</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        style={{
                          marginLeft: '10px',
                          padding: '6px 8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          width: '150px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Period (YYYY-MM):</label>
                      <input
                        type="text"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        placeholder="2024-01"
                        style={{
                          marginLeft: '10px',
                          padding: '6px 8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          width: '120px',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="metadata-box">
                  <h3>Financial Summary</h3>
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="label">Total Revenue:</span>
                      <span className="value">
                        ${splitResult.metadata.total_revenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">COGS:</span>
                      <span className="value">${splitResult.metadata.total_cogs.toFixed(2)}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Gross Profit:</span>
                      <span className="value">
                        ${splitResult.metadata.gross_profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Expenses:</span>
                      <span className="value">
                        ${splitResult.metadata.total_expenses.toFixed(2)}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Net Profit:</span>
                      <span className="value">${splitResult.metadata.net_profit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <IncomeStatementPreview data={{
                  revenue: splitResult.metadata.total_revenue,
                  cogs: splitResult.metadata.total_cogs,
                  expenses: splitResult.metadata.total_expenses,
                }} />

                <SalesOrderPreview orders={splitResult.salesOrders} />

                {expenseResult && (
                  <ExpenseDetailPreview
                    expenses={expenseResult.expenses}
                    totalExpenses={expenseResult.totalExpenses}
                  />
                )}

                {cogsResult && (
                  <COGSDetailPreview
                    cogsDetails={cogsResult.cogsDetails}
                    totalCOGS={cogsResult.totalCOGS}
                    totalQuantity={cogsResult.totalQuantity}
                    salesOrderTotalQty={cogsResult.salesOrderTotalQty}
                    quantityMatches={cogsResult.quantityMatches}
                    quantityDifference={cogsResult.quantityDifference}
                  />
                )}

                {activityDriverResult && (
                  <ActivityDriverPreview
                    activities={activityDriverResult.activities}
                    totalActivities={activityDriverResult.totalActivities}
                  />
                )}

                {inventoryResult && (
                  <InventoryPreview
                    inventoryDetails={inventoryResult.inventoryDetails}
                    totalPurchaseQty={inventoryResult.totalPurchaseQty}
                    totalEndingQty={inventoryResult.totalEndingQty}
                    totalPurchaseAmount={inventoryResult.totalPurchaseAmount}
                    totalEndingAmount={inventoryResult.totalEndingAmount}
                  />
                )}

                <div className="download-section">
                  <h3>Download Generated Files</h3>
                  <a
                    href={`${API_BASE_URL}${splitResult.downloads.incomeStatement}?company=${encodeURIComponent(company)}&period=${encodeURIComponent(period)}`}
                    className="download-btn"
                  >
                    📊 Income Statement
                  </a>
                  <a
                    href={`${API_BASE_URL}${splitResult.downloads.salesOrder}?company=${encodeURIComponent(company)}&period=${encodeURIComponent(period)}`}
                    className="download-btn"
                  >
                    📦 Sales Order
                  </a>
                  {splitResult.downloads.cogsDetail && (
                    <a
                      href={`${API_BASE_URL}${splitResult.downloads.cogsDetail}?company=${encodeURIComponent(company)}&period=${encodeURIComponent(period)}`}
                      className="download-btn"
                    >
                      📈 COGS Detail
                    </a>
                  )}
                  {splitResult.downloads.activityDriver && (
                    <a
                      href={`${API_BASE_URL}${splitResult.downloads.activityDriver}?company=${encodeURIComponent(company)}&period=${encodeURIComponent(period)}`}
                      className="download-btn"
                    >
                      📋 Time Sheet
                    </a>
                  )}
                  {splitResult.downloads.expenseDetail && (
                    <a
                      href={`${API_BASE_URL}${splitResult.downloads.expenseDetail}?company=${encodeURIComponent(company)}&period=${encodeURIComponent(period)}`}
                      className="download-btn"
                    >
                      💰 Expense Detail
                    </a>
                  )}
                  {splitResult.downloads.inventory && (
                    <a
                      href={`${API_BASE_URL}${splitResult.downloads.inventory}?company=${encodeURIComponent(company)}&period=${encodeURIComponent(period)}`}
                      className="download-btn"
                    >
                      📦 Inventory
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="merge-section">
            <MergeUpload onMergeComplete={handleMergeComplete} />

            {mergeResult && (
              <div className="merge-result">
                <div className="verification-box">
                  <h3>Verification Result</h3>
                  <div className="verification-item">
                    <span className="label">Status:</span>
                    <span
                      className={`status ${mergeResult.verification.is_valid ? 'valid' : 'invalid'}`}
                    >
                      {mergeResult.verification.is_valid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  </div>
                  <div className="verification-item">
                    <span className="label">Revenue Match:</span>
                    <span className="value">
                      ${mergeResult.verification.original_revenue.toFixed(2)} →
                      ${mergeResult.verification.merged_revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="verification-item">
                    <span className="label">Difference:</span>
                    <span className="value">
                      ${Math.abs(mergeResult.verification.revenue_difference).toFixed(2)}
                    </span>
                  </div>
                  <div className="verification-item">
                    <span className="label">Orders:</span>
                    <span className="value">{mergeResult.verification.order_count}</span>
                  </div>
                </div>

                <div className="download-section">
                  <a href={mergeResult.download} className="download-btn">
                    📥 Download Merged File
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
