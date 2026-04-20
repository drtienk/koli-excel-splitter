import React, { useState, useRef } from 'react';
import axios from 'axios';

interface FileUploadProps {
  onSplitComplete: (result: any) => void;
  onExpenseComplete?: (result: any) => void;
}

export default function FileUpload({ onSplitComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      alert('Please select an Excel file (.xlsx)');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/split', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        onSplitComplete(response.data);
      } else {
        alert('Error: ' + response.data.message);
      }
    } catch (error: any) {
      alert('Error uploading file: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className={`upload-container ${isDragging ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="upload-input"
          accept=".xlsx"
          onChange={handleFileSelect}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>Processing file...</span>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <div className="upload-text">Drag and drop your Excel file</div>
            <div className="upload-subtext">or click to select</div>
            <button className="upload-btn" disabled={isLoading}>
              Choose File
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f4ff', borderRadius: '8px' }}>
        <h4 style={{ color: '#667eea', marginBottom: '10px' }}>Instructions:</h4>
        <ol style={{ color: '#666', lineHeight: '1.8' }}>
          <li>Upload your KOLI Excel file</li>
          <li>The system will automatically:</li>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
            <li>Extract Sales Revenue data</li>
            <li>Calculate COGS based on material costs</li>
            <li>Generate Income Statement</li>
            <li>Generate Sales Order breakdown</li>
            <li>Generate Expense Detail</li>
          </ul>
          <li>Review the validation report for any errors</li>
          <li>Download the split files</li>
        </ol>
      </div>
    </div>
  );
}
