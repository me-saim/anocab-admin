import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminsAPI } from '../../services/api';
import { useDialog } from '../../components/DialogProvider/DialogProvider';
import './AdminForm.css';

const AdminForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dialog = useDialog();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'admin',
    status: 1
  });

  useEffect(() => {
    if (id) {
      fetchAdmin();
    }
  }, [id]);

  const fetchAdmin = async () => {
    try {
      const response = await adminsAPI.getById(id);
      const admin = response.data;
      setFormData({
        username: admin.username || '',
        email: admin.email || '',
        password: '',
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        role: admin.role || 'admin',
        status: admin.status !== undefined ? admin.status : 1
      });
    } catch (error) {
      console.error('Error fetching admin:', error);
      await dialog.alert('Error fetching admin: ' + (error.message || 'Unknown error'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = { ...formData };
      if (id && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (id) {
        await adminsAPI.update(id, dataToSend);
        await dialog.alert('Admin updated successfully!');
      } else {
        await adminsAPI.create(dataToSend);
        await dialog.alert('Admin created successfully!');
      }
      navigate('/admins');
    } catch (error) {
      console.error('Error saving admin:', error);
      await dialog.alert('Error saving admin: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-page">
      <div className="form-container">
        <div className="form-header">
          <h2>{id ? 'Edit Admin' : 'Add New Admin'}</h2>
          <button type="button" className="btn-back" onClick={() => navigate('/admins')}>
            ← Back to Admins
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-section">
            <h3>Admin Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password {!id && '*'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!id}
                  placeholder={id ? "Leave empty to keep current" : ""}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admins')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update Admin' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;
