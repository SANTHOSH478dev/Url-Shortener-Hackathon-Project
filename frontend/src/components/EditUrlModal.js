import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './Modal.css';

const EditUrlModal = ({ url, onClose, onUpdated }) => {
  const [originalUrl, setOriginalUrl] = useState(url.originalUrl);
  const [expiresAt, setExpiresAt] = useState(
    url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : ''
  );
  const [isActive, setIsActive] = useState(url.isActive);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!originalUrl.trim() || !isValidUrl(originalUrl.trim())) {
      setError('Enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        originalUrl: originalUrl.trim(),
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      const { data } = await api.put(`/urls/${url._id}`, payload);
      toast.success('Link updated successfully');
      onUpdated(data);
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update link';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Link</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="editOriginalUrl">
                Destination URL
              </label>
              <input
                id="editOriginalUrl"
                type="text"
                className={`form-control ${error ? 'is-invalid' : ''}`}
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
              />
              {error && <span className="form-error">{error}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editExpiresAt">
                Expiry Date
              </label>
              <input
                id="editExpiresAt"
                type="datetime-local"
                className="form-control"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <span className="form-hint">Leave empty for no expiry</span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Link Active
              </label>
            </div>

            <div className="flex gap-1 mt-3" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUrlModal;
