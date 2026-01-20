import React, { useEffect, useState } from 'react';
import { paymentTransactionsAPI } from '../../services/api';
import './PaymentTransactions.css';

const PaymentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', user_id: '' });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await paymentTransactionsAPI.getAll(params);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', class: 'status-pending' },
      success: { label: 'Success', class: 'status-active' },
      failed: { label: 'Failed', class: 'status-suspended' },
      cancelled: { label: 'Cancelled', class: 'status-inactive' },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  return (
    <div className="payment-transactions-page">
      <div className="page-header">
        <h2>Payment Transactions</h2>
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
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading transactions...</div>
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
                <th>Beneficiary Phone</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.id}</td>
                    <td className="code-cell">{txn.order_id}</td>
                    <td>{txn.first_name} {txn.last_name}</td>
                    <td>{txn.m_number}</td>
                    <td>₹{parseFloat(txn.amount || 0).toFixed(2)}</td>
                    <td>{getStatusBadge(txn.status)}</td>
                    <td>{txn.beneficiary_phone_no}</td>
                    <td>{new Date(txn.created_at).toLocaleString()}</td>
                    <td>
                      <button className="btn-action">View</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentTransactions;
