import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './BulkUpload.css';

const BulkUpload = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a .csv file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setResults(null);
    try {
      const { data } = await api.post('/urls/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(data.results);
      const successCount = data.results.filter((r) => r.status === 'success').length;
      toast.success(`${successCount} of ${data.results.length} URLs shortened successfully`);
      onComplete();
    } catch (err) {
      const message = err.response?.data?.message || 'Bulk upload failed';
      toast.error(message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card card-padded bulk-upload-card mb-3">
      <div className="flex-between">
        <div>
          <h2 className="create-url-title" style={{ marginBottom: '0.25rem' }}>
            Bulk Shorten via CSV
          </h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Upload a .csv file with a column named <code>url</code> containing one long URL per row.
          </p>
        </div>
        <label className="btn btn-secondary btn-sm" htmlFor="csvUpload">
          {loading ? <span className="spinner spinner-dark" /> : 'Upload CSV'}
        </label>
        <input
          id="csvUpload"
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={loading}
        />
      </div>

      {results && (
        <div className="bulk-results mt-2">
          {results.map((r, idx) => (
            <div className={`bulk-result-row ${r.status}`} key={idx}>
              <span className="bulk-result-icon">{r.status === 'success' ? '✅' : '❌'}</span>
              <span className="bulk-result-text">{r.originalUrl}</span>
              {r.status === 'success' ? (
                <span className="bulk-result-short">{r.shortUrl}</span>
              ) : (
                <span className="bulk-result-reason">{r.reason}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
