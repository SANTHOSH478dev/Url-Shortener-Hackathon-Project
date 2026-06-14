import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './Modal.css';

const QRCodeModal = ({ urlId, shortUrl, onClose }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const { data } = await api.get(`/urls/${urlId}/qrcode`);
        setQrCode(data.qrCode);
      } catch (err) {
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };
    fetchQr();
  }, [urlId]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>QR Code</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body text-center">
          {loading && (
            <div className="flex-center" style={{ minHeight: 200 }}>
              <span className="spinner spinner-dark" />
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          {qrCode && (
            <>
              <img src={qrCode} alt="QR Code" className="qr-image" />
              <p className="text-muted mt-2 short-url-display" onClick={handleCopyLink}>
                {shortUrl}
              </p>
              <div className="flex gap-1 mt-2" style={{ justifyContent: 'center' }}>
                <button className="btn btn-primary btn-sm" onClick={handleDownload}>
                  Download PNG
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
                  Copy Link
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
