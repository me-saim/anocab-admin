import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import { useDialog } from '../../components/DialogProvider/DialogProvider';
import { userKycAPI } from '../../services/api';
import './KYCApprovals.css';

function safeParseAdmin() {
  try {
    const admin = JSON.parse(localStorage.getItem('admin') || 'null');
    return admin && admin.id ? admin : null;
  } catch {
    return null;
  }
}

const KYCApprovals = () => {
  const dialog = useDialog();
  const admin = useMemo(() => safeParseAdmin(), []);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ approval_status: 'pending', user_id: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approved' | 'rejected'
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined));
      const res = await userKycAPI.getAll(params);
      setRecords(res.data || []);
    } catch (error) {
      console.error('Error fetching KYC records:', error);
      await dialog.alert('Error fetching KYC records: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Pending', class: 'status-pending' },
      approved: { label: 'Approved', class: 'status-active' },
      rejected: { label: 'Rejected', class: 'status-suspended' },
    };
    const info = map[status] || map.pending;
    return <span className={`badge ${info.class}`}>{info.label}</span>;
  };

  const openApprovalModal = (record, nextStatus) => {
    setSelected(record);
    setActionType(nextStatus);
    setNotes(record?.admin_notes || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setActionType(null);
    setNotes('');
    setSaving(false);
  };

  const handleSubmitApproval = async (e) => {
    e.preventDefault();
    if (!selected || !actionType) return;

    if (!admin?.id) {
      await dialog.alert('Admin session not found. Please login again.');
      return;
    }

    const ok = await dialog.confirm(`Are you sure you want to ${actionType} this KYC?`, {
      title: 'Confirm',
      okText: 'Yes',
      cancelText: 'No',
    });
    if (!ok) return;

    try {
      setSaving(true);
      await userKycAPI.updateApproval(selected.id, {
        approval_status: actionType,
        approved_by: admin.id,
        admin_notes: notes,
      });
      await dialog.alert('KYC updated successfully!');
      closeModal();
      fetchRecords();
    } catch (error) {
      console.error('Error updating KYC:', error);
      await dialog.alert('Error updating KYC: ' + (error.message || 'Unknown error'));
      setSaving(false);
    }
  };

  return (
    <div className="kyc-approvals-page">
      <div className="page-header">
        <h2>KYC Approvals</h2>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="User ID"
          className="filter-input"
          value={filters.user_id}
          onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
        />
        <select
          className="filter-select"
          value={filters.approval_status}
          onChange={(e) => setFilters({ ...filters, approval_status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading KYC records...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Mobile</th>
                <th>IFSC</th>
                <th>Account No.</th>
                <th>Aadhaar</th>
                <th>PAN</th>
                <th>UPI</th>
                <th>Status</th>
                <th>Approved By</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.first_name} {r.last_name}</td>
                    <td>{r.m_number}</td>
                    <td>{r.ifsc_code || '-'}</td>
                    <td>{r.account_number || '-'}</td>
                    <td>{r.aadhaar_number || '-'}</td>
                    <td>{r.pan_number || '-'}</td>
                    <td>{r.upi_id || '-'}</td>
                    <td>{getStatusBadge(r.approval_status)}</td>
                    <td>{r.approved_by_name || '-'}</td>
                    <td>{r.updated_at ? new Date(r.updated_at).toLocaleString() : '-'}</td>
                    <td>
                      <button
                        className="btn-action"
                        disabled={r.approval_status === 'approved'}
                        onClick={() => openApprovalModal(r, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-action btn-danger"
                        disabled={r.approval_status === 'rejected'}
                        onClick={() => openApprovalModal(r, 'rejected')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="no-data">No KYC records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={actionType === 'approved' ? 'Approve KYC' : 'Reject KYC'}
        size="medium"
      >
        <form onSubmit={handleSubmitApproval} className="kyc-approval-form">
          <div className="form-row">
            <div className="form-group full-width">
              <label>Admin Notes (optional)</label>
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write notes (optional)"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={closeModal} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (actionType === 'approved' ? 'Approve' : 'Reject')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KYCApprovals;

