import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { qrCodesAPI } from '../../services/api';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import './QRCodes.css';

const QRCodes = () => {
  const navigate = useNavigate();
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [formData, setFormData] = useState({
    product: '',
    details: '',
    points: 0,
    expires_at: ''
  });
  const [filters, setFilters] = useState({ is_scanned: '', search: '' });

  useEffect(() => {
    fetchQRCodes();
  }, [filters]);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await qrCodesAPI.getAll(params);
      setQrCodes(response.data);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      alert('Error fetching QR codes: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (qr = null) => {
    if (qr) {
      setSelectedQR(qr);
      setFormData({
        product: qr.product || '',
        details: qr.details || '',
        points: qr.points || 0,
        expires_at: qr.expires_at ? qr.expires_at.split('T')[0] : ''
      });
    } else {
      setSelectedQR(null);
      setFormData({
        product: '',
        details: '',
        points: 0,
        expires_at: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQR(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      const admin = JSON.parse(localStorage.getItem('admin') || '{}');
      if (!selectedQR) {
        dataToSend.created_by = admin.id;
      }
      dataToSend.points = parseFloat(dataToSend.points) || 0;
      if (dataToSend.expires_at) {
        dataToSend.expires_at = new Date(dataToSend.expires_at).toISOString();
      } else {
        delete dataToSend.expires_at;
      }

      if (selectedQR) {
        await qrCodesAPI.update(selectedQR.id, dataToSend);
        alert('QR code updated successfully!');
        handleCloseModal();
        fetchQRCodes();
      } else {
        await qrCodesAPI.create(dataToSend);
        alert('QR code created successfully! Please use the form page to generate and download QR codes.');
        handleCloseModal();
        fetchQRCodes();
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('Error saving QR code: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteClick = (qr) => {
    setSelectedQR(qr);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await qrCodesAPI.delete(selectedQR.id);
      alert('QR code deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedQR(null);
      fetchQRCodes();
    } catch (error) {
      console.error('Error deleting QR code:', error);
      alert('Error deleting QR code: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="qrcodes-page">
      <div className="page-header">
        <h2>QR Codes Management</h2>
        <Link to="/qr-codes/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Add New QR Code</Link>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search QR codes..."
          className="filter-input"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="filter-select"
          value={filters.is_scanned}
          onChange={(e) => setFilters({ ...filters, is_scanned: e.target.value })}
        >
          <option value="">All</option>
          <option value="0">Not Scanned</option>
          <option value="1">Scanned</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading QR codes...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>QR Code</th>
                <th>Product</th>
                <th>Details</th>
                <th>Points</th>
                <th>Status</th>
                <th>Scanned By</th>
                <th>Scanned At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qrCodes.length > 0 ? (
                qrCodes.map((qr) => (
                  <tr key={qr.id}>
                    <td>{qr.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={`https://quickchart.io/chart?cht=qr&chs=80x80&chl=${encodeURIComponent(qr.code)}`}
                          alt="QR Code"
                          style={{ width: '50px', height: '50px', border: '1px solid #e0e0e0', padding: '2px', backgroundColor: '#fff' }}
                        />
                        <span className="code-cell" style={{ fontSize: '11px' }}>{qr.code}</span>
                      </div>
                    </td>
                    <td>{qr.product || '-'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {qr.details || '-'}
                    </td>
                    <td>{parseFloat(qr.points || 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${qr.is_scanned === 1 ? 'status-active' : 'status-inactive'}`}>
                        {qr.is_scanned === 1 ? 'Scanned' : 'Not Scanned'}
                      </span>
                    </td>
                    <td>{qr.scanned_by_number || '-'}</td>
                    <td>{qr.scanned_at ? new Date(qr.scanned_at).toLocaleString() : '-'}</td>
                    <td>
                      <button className="btn-action" onClick={() => navigate(`/qr-codes/${qr.id}/edit`)}>Edit</button>
                      <button className="btn-action btn-danger" onClick={() => handleDeleteClick(qr)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">No QR codes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedQR ? 'Edit QR Code' : 'Add New QR Code'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="qrcode-form">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              required
              placeholder="Enter product name"
            />
          </div>

          <div className="form-group">
            <label>Product Details *</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              required
              rows="3"
              placeholder="Enter product details"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reward Points *</label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Expires At</label>
              <input
                type="date"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedQR(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete QR Code"
        message={`Are you sure you want to delete QR code "${selectedQR?.product || selectedQR?.code}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default QRCodes;
