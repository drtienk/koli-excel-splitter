import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://koli-excel-splitter-production.up.railway.app';

interface MergeUploadProps {
  onMergeComplete: (result: any) => void;
}

export default function MergeUpload({ onMergeComplete }: MergeUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter((f) => f.name.endsWith('.xlsx'));

      if (validFiles.length === 2) {
        setFiles(validFiles);
      } else {
        alert('Please select exactly 2 Excel files');
        setFiles([]);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length !== 2) {
      alert('Please select 2 files to merge');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('files', files[0]);
      formData.append('files', files[1]);

      const response = await axios.post(`${API_BASE_URL}/api/merge`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        onMergeComplete(response.data);
      } else {
        alert('Error: ' + response.data.message);
      }
    } catch (error: any) {
      alert('Error merging files: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Select Files to Merge</h3>

        <button
          className="upload-btn"
          onClick={handleClick}
          disabled={isLoading}
          style={{ marginBottom: '15px' }}
        >
          Choose Files (Select 2)
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="upload-input"
          accept=".xlsx"
          onChange={handleFileSelect}
          disabled={isLoading}
        />

        {files.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '10px', color: '#333' }}>Selected Files:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {files.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f0f4ff',
                    borderRadius: '6px',
                    border: '1px solid #667eea',
                  }}
                >
                  <span style={{ color: '#333', fontWeight: '600' }}>
                    {idx + 1}. {file.name}
                  </span>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    style={{
                      padding: '6px 12px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {files.length === 2 && (
              <button
                className="upload-btn"
                onClick={handleMerge}
                disabled={isLoading}
                style={{ marginTop: '20px', width: '100%' }}
              >
                {isLoading ? '🔄 Merging...' : '✓ Merge Files'}
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '15px', background: '#f0f4ff', borderRadius: '8px' }}>
        <h4 style={{ color: '#667eea', marginBottom: '10px' }}>How to Merge:</h4>
        <ol style={{ color: '#666', lineHeight: '1.8' }}>
          <li>Select the Income Statement file</li>
          <li>Select the Sales Order file</li>
          <li>Click "Merge Files"</li>
          <li>System will verify the files match using checksum</li>
          <li>Download the merged file</li>
        </ol>
      </div>
    </div>
  );
}
