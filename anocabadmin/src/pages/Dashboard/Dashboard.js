import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecent(),
      ]);
      setStats(statsRes.data);
      setRecent(recentRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-value">{stats?.totalUsers || 0}</p>
            <span className="stat-sub">Active: {stats?.activeUsers || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Points</h3>
            <p className="stat-value">{parseFloat(stats?.totalPoints || 0).toFixed(2)}</p>
            <span className="stat-sub">Redeemed: ₹{parseFloat(stats?.totalRedeemed || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔲</div>
          <div className="stat-info">
            <h3>QR Codes</h3>
            <p className="stat-value">{stats?.totalQRCodes || 0}</p>
            <span className="stat-sub">Scanned: {stats?.scannedQRCodes || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>Redeem Transactions</h3>
            <p className="stat-value">{stats?.totalRedeems || 0}</p>
            <span className="stat-sub">Pending: {stats?.pendingRedeems || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>Blogs</h3>
            <p className="stat-value">{stats?.totalBlogs || 0}</p>
            <span className="stat-sub">Published: {stats?.publishedBlogs || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>Catalogs</h3>
            <p className="stat-value">{stats?.totalCatalogs || 0}</p>
          </div>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Recent Activities</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Name/ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.length > 0 ? (
              recent.map((activity, index) => (
                <tr key={index}>
                  <td><span className="badge">{activity.type}</span></td>
                  <td>{activity.name}</td>
                  <td>{new Date(activity.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">No recent activities</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
