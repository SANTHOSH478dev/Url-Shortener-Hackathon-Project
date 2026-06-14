import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './PublicStats.css';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PublicStats = () => {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: res } = await api.get(`/stats/${shortCode}`);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Short URL not found');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [shortCode]);

  return (
    <div className="page public-stats-page">
      <div className="card card-padded public-stats-card">
        {loading ? (
          <div className="flex-center" style={{ minHeight: 160 }}>
            <span className="spinner spinner-dark" />
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>{error}</h3>
            <Link to="/" className="btn btn-primary mt-2">
              Go Home
            </Link>
          </div>
        ) : (
          <>
            <h1 className="public-stats-title">📊 Link Stats</h1>
            <p className="text-muted mb-2">{data.shortUrl}</p>

            <div className="public-stats-grid">
              <div>
                <span className="stat-label">Total Clicks</span>
                <span className="stat-value">{data.totalClicks}</span>
              </div>
              <div>
                <span className="stat-label">Status</span>
                <span className="stat-value-sm">
                  {data.isActive ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-muted">Disabled</span>
                  )}
                </span>
              </div>
              <div>
                <span className="stat-label">Created</span>
                <span className="stat-value-sm">{formatDate(data.createdAt)}</span>
              </div>
              <div>
                <span className="stat-label">Last Visited</span>
                <span className="stat-value-sm">{formatDate(data.lastVisited)}</span>
              </div>
            </div>

            <Link to="/" className="btn btn-secondary mt-3">
              Create your own short link →
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicStats;
