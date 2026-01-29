import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../../images/anocab_text_logo.png';
import { notificationsAPI } from '../../services/api';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCounts, setNotificationCounts] = useState({ pending_redeems: 0, pending_kyc: 0 });
  const notifRef = useRef(null);

  const notifBadgeCount = useMemo(() => {
    const n1 = Number(notificationCounts?.pending_redeems || 0);
    const n2 = Number(notificationCounts?.pending_kyc || 0);
    const sum = (Number.isFinite(n1) ? n1 : 0) + (Number.isFinite(n2) ? n2 : 0);
    return Math.max(0, sum);
  }, [notificationCounts]);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/admins', label: 'Admins', icon: '👤' },
    { path: '/blogs', label: 'Blogs', icon: '📝' },
    { path: '/catalog', label: 'Catalog', icon: '📚' },
    { path: '/qr-codes', label: 'QR Codes', icon: '🔲' },
    { path: '/qr-scans', label: 'QR Scans', icon: '📱' },
    { path: '/redeem-transactions', label: 'Redeem Transactions', icon: '💰' },
    { path: '/redeem-approvals', label: 'Redeem Approvals', icon: '✅' },
    { path: '/payment-transactions', label: 'Payment Transactions', icon: '💳' },
    { path: '/calculator-data', label: 'Calculator Data', icon: '🧮' },
    { path: '/point-value-settings', label: 'Point Value', icon: '⚖️' },
    { path: '/kyc-approvals', label: 'KYC Approvals', icon: '🪪' },
  ];

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const res = await notificationsAPI.getAll({ limit: 25, per_type: 10 });
      setNotifications(res.data?.items || []);
      setNotificationCounts(res.data?.counts || { pending_redeems: 0, pending_kyc: 0 });
    } catch (err) {
      // Keep UI quiet; just log
      // eslint-disable-next-line no-console
      console.error('Failed to fetch notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    // Keep badge roughly up to date
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;

    const onDocMouseDown = (e) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setNotificationsOpen(false);
    };

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [notificationsOpen]);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/login', { replace: true });
  };

  const handleToggleNotifications = async () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next) {
      await fetchNotifications();
    }
  };

  const handleNotificationClick = (item) => {
    if (item?.link) {
      navigate(item.link);
    }
    setNotificationsOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2><img src={logoImage} alt="Anocab" style={{ width: '100%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} /></h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}> 
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-header">
          <h1>Admin Control Panel</h1>
          <div className="header-actions" ref={notifRef}>
            <button type="button" className="notification-btn" onClick={handleToggleNotifications} aria-label="Notifications">
              <span className="notification-icon" aria-hidden="true">🔔</span>
              {notifBadgeCount > 0 && (
                <span className="notification-badge">
                  {notifBadgeCount > 99 ? '99+' : String(notifBadgeCount)}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <div className="notifications-title">Updates</div>
                  <button
                    type="button"
                    className="notifications-refresh"
                    onClick={fetchNotifications}
                    disabled={notificationsLoading}
                  >
                    {notificationsLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                <div className="notifications-summary">
                  <span className="summary-chip">Pending redeems: {Number(notificationCounts?.pending_redeems || 0)}</span>
                  <span className="summary-chip">Pending KYC: {Number(notificationCounts?.pending_kyc || 0)}</span>
                </div>

                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="notifications-empty">No updates</div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className="notification-item"
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="notification-item-title">{n.title}</div>
                        <div className="notification-item-message">{n.message}</div>
                        <div className="notification-item-time">
                          {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="notifications-footer">
                  <button type="button" className="notifications-link" onClick={() => { navigate('/redeem-approvals'); setNotificationsOpen(false); }}>
                    Go to Redeem Approvals
                  </button>
                  <button type="button" className="notifications-link" onClick={() => { navigate('/kyc-approvals'); setNotificationsOpen(false); }}>
                    Go to KYC Approvals
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
