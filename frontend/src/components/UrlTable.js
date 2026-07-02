import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import QRCodeModal from "./QRCodeModal";
import EditUrlModal from "./EditUrlModal";
import "./UrlTable.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (url) => {
  if (!url.isActive) return <span className="badge badge-muted">Disabled</span>;
  if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
    return <span className="badge badge-danger">Expired</span>;
  }
  return (
    <span className="badge badge-success">
      <span className="badge-dot" />
      Active
    </span>
  );
};

const UrlTable = ({ urls, onDelete, onUpdate }) => {
  const [qrModalUrl, setQrModalUrl] = useState(null);
  const [editModalUrl, setEditModalUrl] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (shortUrl, id) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Short URL copied to clipboard!");
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1400);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this short URL? This cannot be undone.",
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/urls/${id}`);
      toast.success("Short URL deleted");
      onDelete(id);
    } catch (err) {
      toast.error("Failed to delete short URL");
    } finally {
      setDeletingId(null);
    }
  };

  if (urls.length === 0) {
    return (
      <div className="card card-padded animate-in">
        <div className="empty-state">
          <div className="empty-state-icon">🔗</div>
          <h3>No short links yet</h3>
          <p>Create your first short link using the form above.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="card url-table-wrapper desktop-only">
        <table className="url-table">
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short URL</th>
              <th>Created</th>
              <th>Clicks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url, idx) => (
              <tr
                key={url._id}
                className="url-row"
                style={{ animationDelay: `${Math.min(idx, 8) * 0.04}s` }}
              >
                <td className="url-cell" title={url.originalUrl}>
                  {url.originalUrl}
                </td>
                <td>
                  <a
                  href={url.shortUrl || `https://url-shortener-hackathon-project.onrender.com/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="short-link text-mono"
                  >
                 {(url.shortUrl ||
`https://url-shortener-hackathon-project.onrender.com/${url.shortCode}`)
.replace(/^https?:\/\//, "")}
                  </a>
                </td>
                <td className="text-muted">{formatDate(url.createdAt)}</td>
                <td>
                  <span className="badge badge-muted">{url.clicks}</span>
                </td>
                <td>{getStatusBadge(url)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className={`btn btn-icon btn-ghost ${copiedId === url._id ? "copied" : ""}`}
                      title="Copy"
                      onClick={() =>
  handleCopy(
    url.shortUrl ||
      `https://url-shortener-hackathon-project.onrender.com/${url.shortCode}`,
    url._id
  )
}
                    >
                      {copiedId === url._id ? "✅" : "📋"}
                    </button>
                    <button
                      className="btn btn-icon btn-ghost"
                      title="QR Code"
                      onClick={() => setQrModalUrl(url)}
                    >
                      📱
                    </button>
                    <Link
                      to={`/analytics/${url._id}`}
                      className="btn btn-icon btn-ghost"
                      title="Analytics"
                    >
                      📊
                    </Link>
                    <button
                      className="btn btn-icon btn-ghost"
                      title="Edit"
                      onClick={() => setEditModalUrl(url)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-icon btn-ghost btn-icon-danger"
                      title="Delete"
                      onClick={() => handleDelete(url._id)}
                      disabled={deletingId === url._id}
                    >
                      {deletingId === url._id ? (
                        <span
                          className="spinner spinner-dark"
                          style={{ width: 14, height: 14 }}
                        />
                      ) : (
                        "🗑️"
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="url-cards mobile-only">
        {urls.map((url, idx) => (
          <div
            className="card card-padded url-card animate-in"
            key={url._id}
            style={{ animationDelay: `${Math.min(idx, 8) * 0.05}s` }}
          >
            <div className="flex-between mb-1">
              {getStatusBadge(url)}
              <span className="badge badge-muted">{url.clicks} clicks</span>
            </div>
            <p className="url-cell mb-1" title={url.originalUrl}>
              {url.originalUrl}
            </p>
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="short-link text-mono mb-1"
            >
              {url.shortUrl.replace(/^https?:\/\//, "")}
            </a>
            <p className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
              Created {formatDate(url.createdAt)}
            </p>
            <div className="action-buttons">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleCopy(url.shortUrl, url._id)}
              >
                {copiedId === url._id ? "✅ Copied" : "📋 Copy"}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setQrModalUrl(url)}
              >
                📱 QR
              </button>
              <Link
                to={`/analytics/${url._id}`}
                className="btn btn-secondary btn-sm"
              >
                📊 Stats
              </Link>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditModalUrl(url)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(url._id)}
                disabled={deletingId === url._id}
              >
                {deletingId === url._id ? (
                  <span
                    className="spinner spinner-dark"
                    style={{ width: 14, height: 14 }}
                  />
                ) : (
                  "🗑️ Delete"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

{qrModalUrl && (
  <QRCodeModal
    urlId={qrModalUrl._id}
    shortUrl={
      qrModalUrl.shortUrl ||
      `https://url-shortener-hackathon-project.onrender.com/${qrModalUrl.shortCode}`
    }
    onClose={() => setQrModalUrl(null)}
  />
)}

{editModalUrl && (
  <EditUrlModal
    url={editModalUrl}
    onClose={() => setEditModalUrl(null)}
    onUpdated={(updated) => onUpdate(updated)}
  />
)}
    </>
  );
};

export default UrlTable;
