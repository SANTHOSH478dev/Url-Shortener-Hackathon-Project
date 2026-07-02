import React, { useEffect, useState } from "react";
import api from "../utils/api";
import CreateUrlForm from "../components/CreateUrlForm";
import BulkUpload from "../components/BulkUpload";
import UrlTable from "../components/UrlTable";
import "./Dashboard.css";

const AnimatedCounter = ({ value, duration = 600 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = null;
    let raf;

    const step = (timestamp) => {
      if (start === null) start = timestamp;

      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    setDisplay(0);
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

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
      const response = await api.get("/urls");

      console.log("Backend Response:", response.data);

      if (Array.isArray(response.data)) {
        setUrls(response.data);
      } else if (Array.isArray(response.data.urls)) {
        setUrls(response.data.urls);
      } else if (Array.isArray(response.data.data)) {
        setUrls(response.data.data);
      } else {
        console.error("Unexpected API Response:", response.data);
        setUrls([]);
      }
    } catch (err) {
      console.error(err);
      setUrls([]);
      setError("Failed to load your links. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  const handleDelete = (id) => {
    setUrls((prev) => prev.filter((u) => u._id !== id));
  };

  const handleUpdate = (updated) => {
    setUrls((prev) =>
      prev.map((u) => (u._id === updated._id ? updated : u))
    );
  };

  const safeUrls = Array.isArray(urls) ? urls : [];

  const totalClicks = safeUrls.reduce(
    (sum, item) => sum + (item.clicks || 0),
    0
  );

  const activeLinks = safeUrls.filter((item) => item.isActive).length;

  const statValues = {
    total: safeUrls.length,
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
        {STAT_CONFIG.map((stat, index) => (
          <div
            key={stat.key}
            className="card card-padded stat-card animate-in"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <div className={`stat-icon ${stat.className}`}>
              {stat.icon}
            </div>

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
          <span className="spinner spinner-dark"></span>
        </div>
      ) : error ? (
        <div className="card card-padded">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button
              className="btn btn-primary"
              onClick={fetchUrls}
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div
          className="animate-in"
          style={{ animationDelay: "0.26s" }}
        >
          <UrlTable
            urls={safeUrls}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
