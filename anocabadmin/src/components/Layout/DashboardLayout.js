import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../../images/anocab_text_logo.png';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/admins', label: 'Admins', icon: '👤' },
    { path: '/blogs', label: 'Blogs', icon: '📝' },
    { path: '/catalog', label: 'Catalog', icon: '📚' },
    { path: '/qr-codes', label: 'QR Codes', icon: '🔲' },
    { path: '/qr-scans', label: 'QR Scans', icon: '📱' },
    { path: '/redeem-transactions', label: 'Redeem Transactions', icon: '💰' },
    { path: '/payment-transactions', label: 'Payment Transactions', icon: '💳' },
    { path: '/calculator-data', label: 'Calculator Data', icon: '🧮' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/login', { replace: true });
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
        </header>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
