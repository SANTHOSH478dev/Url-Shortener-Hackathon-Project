import React, { useEffect, useState } from "react";
import api from "../utils/api";
import CreateUrlForm from "../components/CreateUrlForm";
import BulkUpload from "../components/BulkUpload";
import UrlTable from "../components/UrlTable";
import "./Dashboard.css";

/** Counts up from 0 to `value` whenever `value` changes. */
const AnimatedCounter = ({ value, duration = 600 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = null;
    let raf;
    const from = display;
    const to = value;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{display}</span>;
};

const STAT_CONFIG = [
  {
    key: "total",
    label: "Total Links",
    icon: "🔗",
    className: "stat-icon-primary",
  },
  {
    key: "clicks",
    label: "Total Clicks",
    icon: "👆",
    className: "stat-icon-cyan",
  },
  {
    key: "active",
    label: "Active Links",
    icon: "✅",
    className: "stat-icon-success",
  },
];

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUrls = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/urls");
      setUrls(data);
    } catch (err) {
      setError("Failed to load your links. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  const handleDelete = (id) => {
    setUrls((prev) => prev.filter((u) => u._id !== id));
  };

  const handleUpdate = (updated) => {
    setUrls((prev) =>
      prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u)),
    );
  };

  const totalClicks = urls.reduce((sum, u) => sum + (u.clicks || 0), 0);
  const activeLinks = urls.filter((u) => u.isActive).length;

  const statValues = {
    total: urls.length,
    clicks: totalClicks,
    active: activeLinks,
  };

  return (
    <div className="page container dashboard">
      <div className="dashboard-header animate-in">
        <div>
          <span className="dashboard-eyebrow">Welcome back</span>
          <h1>Dashboard</h1>
          <p className="text-muted">
            Manage your short links and track performance
          </p>
        </div>
      </div>

      <div className="stats-grid mb-3">
        {STAT_CONFIG.map((stat, i) => (
          <div
            className="card card-padded stat-card animate-in"
            key={stat.key}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className={`stat-icon ${stat.className}`}>{stat.icon}</div>
            <div>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">
                <AnimatedCounter value={statValues[stat.key]} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="dashboard-section animate-in"
        style={{ animationDelay: "0.18s" }}
      >
        <CreateUrlForm onCreated={handleCreated} />
      </div>
      <div
        className="dashboard-section animate-in"
        style={{ animationDelay: "0.22s" }}
      >
        <BulkUpload onComplete={fetchUrls} />
      </div>

      {loading ? (
        <div className="full-page-loader" style={{ minHeight: "30vh" }}>
          <span className="spinner spinner-dark" />
        </div>
      ) : error ? (
        <div className="card card-padded">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p className="mb-2">{error}</p>
            <button className="btn btn-primary" onClick={fetchUrls}>
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in" style={{ animationDelay: "0.26s" }}>
          <UrlTable
            urls={urls}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
