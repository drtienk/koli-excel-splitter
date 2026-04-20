import React from 'react';

interface ValidationReportProps {
  validation: {
    status: string;
    summary: {
      total_errors: number;
      total_warnings: number;
      is_valid: boolean;
    };
    validations: Array<{
      type: string;
      severity: string;
      location: string;
      message: string;
      data?: any;
    }>;
  };
}

export default function ValidationReport({ validation }: ValidationReportProps) {
  if (!validation) return null;

  const { summary, validations } = validation;

  return (
    <div className="validation-report">
      <h3>
        {summary.is_valid ? '✓ Validation Passed' : '⚠ Validation Issues'}
      </h3>

      <div className="validation-summary">
        <div className="validation-summary-item">
          <div className="count">{summary.total_errors}</div>
          <div className="label">Errors</div>
        </div>
        <div className="validation-summary-item">
          <div className="count">{summary.total_warnings}</div>
          <div className="label">Warnings</div>
        </div>
        <div className="validation-summary-item">
          <div className="count" style={{ color: summary.is_valid ? '#4caf50' : '#f44336' }}>
            {summary.is_valid ? 'OK' : 'FAIL'}
          </div>
          <div className="label">Status</div>
        </div>
      </div>

      {validations.length > 0 && (
        <>
          <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#333' }}>Details:</h4>
          <div className="validation-messages">
            {validations.map((v, idx) => (
              <div key={idx} className={`validation-message ${v.severity}`}>
                <strong>{v.type}</strong> @ {v.location}
                <div style={{ marginTop: '5px', fontSize: '0.9em' }}>{v.message}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
