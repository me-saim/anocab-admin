import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import { useDialog } from '../../components/DialogProvider/DialogProvider';
import { redeemPayoutsAPI, redeemTransactionsAPI } from '../../services/api';
import './RedeemApprovals.css';

function safeParseAdmin() {
  try {
    const admin = JSON.parse(localStorage.getItem('admin') || 'null');
    return admin && admin.id ? admin : null;
  } catch {
    return null;
  }
}

const RedeemApprovals = () => {
  const dialog = useDialog();
  const admin = useMemo(() => safeParseAdmin(), []);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'pending', user_id: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    payout_method: 'bank',
    payout_reference: '',
    admin_notes: '',
  });

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined));
      const res = await redeemTransactionsAPI.getAll(params);
      setTransactions(res.data || []);
    } catch (error) {
      console.error('Error fetching redeem transactions:', error);
      await dialog.alert('Error fetching redeem transactions: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', class: 'status-pending' },
      processing: { label: 'Processing', class: 'status-processing' },
      completed: { label: 'Completed', class: 'status-active' },
      failed: { label: 'Failed', class: 'status-suspended' },
      cancelled: { label: 'Cancelled', class: 'status-inactive' },
    };
    const info = statusMap[status] || statusMap.pending;
    return <span className={`badge ${info.class}`}>{info.label}</span>;
  };

  const openPayModal = (txn) => {
    setSelectedTxn(txn);
    setForm({
      payout_method: 'bank',
      payout_reference: '',
      admin_notes: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTxn(null);
    setSaving(false);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedTxn) return;
    if (!admin?.id) {
      await dialog.alert('Admin session not found. Please login again.');
      return;
    }

    const ok = await dialog.confirm('Confirm payout and mark this redeem as completed?', {
      title: 'Confirm',
      okText: 'Yes',
      cancelText: 'No',
    });
    if (!ok) return;

    try {
      setSaving(true);
      await redeemPayoutsAPI.markDone({
        redeem_transaction_id: selectedTxn.id,
        processed_by: admin.id,
        payout_method: form.payout_method,
        payout_reference: form.payout_reference,
        admin_notes: form.admin_notes,
      });
      await dialog.alert('Payout marked done and redeem completed!');
      closeModal();
      fetchTransactions();
    } catch (error) {
      console.error('Error marking payout done:', error);
      await dialog.alert('Error: ' + (error.message || 'Unknown error'));
      setSaving(false);
    }
  };

  return (
    <div className="redeem-approvals-page">
      <div className="page-header">
        <h2>Redeem Approvals (Manual Payout)</h2>
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
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading redeem requests...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Order ID</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td className="code-cell">{t.order_id}</td>
                    <td>{t.first_name} {t.last_name}</td>
                    <td>{t.m_number}</td>
                    <td>₹{parseFloat(t.amount || 0).toFixed(2)}</td>
                    <td>{getStatusBadge(t.status)}</td>
                    <td>{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</td>
                    <td>
                      <button
                        className="btn-action"
                        disabled={t.status === 'completed' || t.status === 'cancelled'}
                        onClick={() => openPayModal(t)}
                      >
                        Pay & Mark Done
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">No redeem requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Mark payout as done"
        size="medium"
      >
        <form onSubmit={submit} className="redeem-approval-form">
          <div className="form-row">
            <div className="form-group">
              <label>Payout Method</label>
              <select name="payout_method" value={form.payout_method} onChange={onChange}>
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reference (UTR/Txn ID)</label>
              <input
                type="text"
                name="payout_reference"
                value={form.payout_reference}
                onChange={onChange}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Admin Notes (optional)</label>
              <textarea
                name="admin_notes"
                rows="4"
                value={form.admin_notes}
                onChange={onChange}
                placeholder="Write notes (optional)"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={closeModal} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Mark Done'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RedeemApprovals;

