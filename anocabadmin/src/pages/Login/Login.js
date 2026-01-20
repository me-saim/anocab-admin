import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminsAPI } from '../../services/api';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (admin) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const startTime = Date.now();
      const response = await adminsAPI.login(credentials);
      const endTime = Date.now();
      
      // Log performance (can be removed in production)
      console.log(`Login took ${endTime - startTime}ms`);
      
      if (response.data && response.data.admin) {
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message) {
        setError(error.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Anocab Admin</h1>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
