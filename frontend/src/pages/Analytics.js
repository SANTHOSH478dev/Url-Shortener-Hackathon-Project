import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../utils/api";
import "./Analytics.css";

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#fbbf24",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
];

const formatDate = (dateStr) => {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Counts up from 0 to `value` whenever `value` changes. */
const AnimatedCounter = ({ value, duration = 700 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = null;
    let raf;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{display}</span>;
};

const Analytics = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: res } = await api.get(`/urls/${id}/analytics`);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.shortUrl);
    toast.success("Short URL copied!");
  };

  if (loading) {
    return (
      <div className="full-page-loader">
        <span className="spinner spinner-dark" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page container">
        <div className="card card-padded">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>{error}</h3>
            <Link to="/dashboard" className="btn btn-primary mt-2">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dailyTrends = data.dailyTrends.map((d) => ({
    date: new Date(d._id).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    clicks: d.count,
  }));

  const deviceData = data.deviceBreakdown.map((d) => ({
    name: d._id || "Unknown",
    value: d.count,
  }));

  const browserData = data.browserBreakdown.map((d) => ({
    name: d._id || "Unknown",
    value: d.count,
  }));

  return (
    <div className="page container analytics-page">
      <Link to="/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <div className="analytics-header card card-padded mb-3 animate-in">
        <div>
          <p className="text-muted url-cell" title={data.originalUrl}>
            {data.originalUrl}
          </p>
          <a
            href={data.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="short-link analytics-short-link text-mono"
          >
            {data.shortUrl}
          </a>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
          📋 Copy Link
        </button>
      </div>

      <div className="stats-grid mb-3">
        <div
          className="card card-padded stat-card animate-in"
          style={{ animationDelay: "0.04s" }}
        >
          <div className="stat-icon stat-icon-primary">👆</div>
          <div>
            <span className="stat-label">Total Clicks</span>
            <span className="stat-value">
              <AnimatedCounter value={data.totalClicks} />
            </span>
          </div>
        </div>
        <div
          className="card card-padded stat-card animate-in"
          style={{ animationDelay: "0.08s" }}
        >
          <div className="stat-icon stat-icon-cyan">🕓</div>
          <div>
            <span className="stat-label">Last Visited</span>
            <span className="stat-value-sm">
              {formatDate(data.lastVisited)}
            </span>
          </div>
        </div>
        <div
          className="card card-padded stat-card animate-in"
          style={{ animationDelay: "0.12s" }}
        >
          <div className="stat-icon stat-icon-success">📅</div>
          <div>
            <span className="stat-label">Created On</span>
            <span className="stat-value-sm">{formatDate(data.createdAt)}</span>
          </div>
        </div>
        <div
          className="card card-padded stat-card animate-in"
          style={{ animationDelay: "0.16s" }}
        >
          <div className="stat-icon stat-icon-primary">🚦</div>
          <div>
            <span className="stat-label">Status</span>
            <span className="stat-value-sm">
              {data.isActive ? (
                <span className="badge badge-success">
                  <span className="badge-dot" />
                  Active
                </span>
              ) : (
                <span className="badge badge-muted">Disabled</span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="charts-grid mb-3">
        <div
          className="card card-padded chart-card animate-in"
          style={{ animationDelay: "0.1s" }}
        >
          <h3 className="chart-title">Daily Click Trend (Last 7 Days)</h3>
          {dailyTrends.length === 0 ? (
            <p className="text-muted chart-empty">No click data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e8f5" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  animationDuration={700}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div
          className="card card-padded chart-card animate-in"
          style={{ animationDelay: "0.15s" }}
        >
          <h3 className="chart-title">Device Breakdown</h3>
          {deviceData.length === 0 ? (
            <p className="text-muted chart-empty">No click data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  animationDuration={700}
                >
                  {deviceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div
          className="card card-padded chart-card animate-in"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="chart-title">Browser Breakdown</h3>
          {browserData.length === 0 ? (
            <p className="text-muted chart-empty">No click data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={browserData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  animationDuration={700}
                >
                  {browserData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 2) % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card animate-in" style={{ animationDelay: "0.25s" }}>
        <div className="card-padded" style={{ paddingBottom: 0 }}>
          <h3 className="chart-title">Recent Visit History</h3>
        </div>
        {data.recentVisits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👀</div>
            <h3>No visits yet</h3>
            <p>Share your short link to start tracking visits.</p>
          </div>
        ) : (
          <div className="url-table-wrapper">
            <table className="url-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>OS</th>
                  <th>Referrer</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisits.map((v, idx) => (
                  <tr
                    key={idx}
                    className="url-row"
                    style={{ animationDelay: `${Math.min(idx, 8) * 0.04}s` }}
                  >
                    <td>{formatDate(v.timestamp)}</td>
                    <td>{v.device || "desktop"}</td>
                    <td>{v.browser}</td>
                    <td>{v.os}</td>
                    <td>{v.referrer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
