import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminsAPI } from '../../services/api';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useDialog } from '../../components/DialogProvider/DialogProvider';
import './Admins.css';

const Admins = () => {
  const navigate = useNavigate();
  const dialog = useDialog();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
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
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminsAPI.getAll();
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      await dialog.alert('Error fetching admins: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setSelectedAdmin(admin);
      setFormData({
        username: admin.username || '',
        email: admin.email || '',
        password: '',
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        role: admin.role || 'admin',
        status: admin.status !== undefined ? admin.status : 1
      });
    } else {
      setSelectedAdmin(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'admin',
        status: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (selectedAdmin && !dataToSend.password) {
        delete dataToSend.password;
      }
      if (selectedAdmin) {
        await adminsAPI.update(selectedAdmin.id, dataToSend);
        await dialog.alert('Admin updated successfully!');
      } else {
        await adminsAPI.create(dataToSend);
        await dialog.alert('Admin created successfully!');
      }
      handleCloseModal();
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
      await dialog.alert('Error saving admin: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminsAPI.delete(selectedAdmin.id);
      await dialog.alert('Admin deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      await dialog.alert('Error deleting admin: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="admins-page">
      <div className="page-header">
        <h2>Admins Management</h2>
        <Link to="/admins/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Add New Admin</Link>
      </div>

      {loading ? (
        <div className="loading">Loading admins...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.id}</td>
                    <td>{admin.username}</td>
                    <td>{admin.email}</td>
                    <td>{admin.first_name} {admin.last_name}</td>
                    <td><span className="badge">{admin.role}</span></td>
                    <td>
                      <span className={`badge ${admin.status === 1 ? 'status-active' : 'status-inactive'}`}>
                        {admin.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}</td>
                    <td>
                      <button className="btn-action" onClick={() => navigate(`/admins/${admin.id}/edit`)}>Edit</button>
                      <button className="btn-action btn-danger" onClick={() => handleDeleteClick(admin)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">No admins found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedAdmin ? 'Edit Admin' : 'Add New Admin'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="admin-form">
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
              <label>Password {!selectedAdmin && '*'}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!selectedAdmin}
                placeholder={selectedAdmin ? "Leave empty to keep current" : ""}
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
          setSelectedAdmin(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Admin"
        message={`Are you sure you want to delete admin "${selectedAdmin?.username}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Admins;
