import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './CreateUrlForm.css';

const CreateUrlForm = ({ onCreated }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isValidUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (err) {
      return false;
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!originalUrl.trim()) newErrors.originalUrl = 'Please enter a URL';
    else if (!isValidUrl(originalUrl.trim())) {
      newErrors.originalUrl = 'Enter a valid URL starting with http:// or https://';
    }

    if (customAlias && !/^[a-zA-Z0-9_-]{3,20}$/.test(customAlias)) {
      newErrors.customAlias = '3-20 characters: letters, numbers, hyphens, underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { originalUrl: originalUrl.trim() };
      if (customAlias.trim()) payload.customAlias = customAlias.trim();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();

      const { data } = await api.post('/urls', payload);
      toast.success('Short URL created!');
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setShowAdvanced(false);
      onCreated(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create short URL';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-padded create-url-card">
      <h2 className="create-url-title">Shorten a new URL</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="create-url-row">
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <input
              type="text"
              className={`form-control ${errors.originalUrl ? 'is-invalid' : ''}`}
              placeholder="Paste your long URL here (https://example.com/...)"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
            {errors.originalUrl && <span className="form-error">{errors.originalUrl}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Shorten'}
          </button>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm advanced-toggle"
          onClick={() => setShowAdvanced((prev) => !prev)}
        >
          {showAdvanced ? '− Hide options' : '+ Custom alias / expiry'}
        </button>

        {showAdvanced && (
          <div className="create-url-advanced">
            <div className="form-group">
              <label className="form-label" htmlFor="customAlias">
                Custom Alias (optional)
              </label>
              <input
                id="customAlias"
                type="text"
                className={`form-control ${errors.customAlias ? 'is-invalid' : ''}`}
                placeholder="my-brand-link"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
              {errors.customAlias ? (
                <span className="form-error">{errors.customAlias}</span>
              ) : (
                <span className="form-hint">Leave empty for an auto-generated code</span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="expiresAt">
                Expiry Date (optional)
              </label>
              <input
                id="expiresAt"
                type="datetime-local"
                className="form-control"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateUrlForm;
