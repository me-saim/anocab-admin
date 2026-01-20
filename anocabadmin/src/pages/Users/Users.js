import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import './Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userID: '',
    first_name: '',
    last_name: '',
    dob: '',
    m_number: '',
    gender: 'Male',
    user_type: 'regular_user',
    country_code: 91,
    email: '',
    password: '',
    city: '',
    status: 0,
    address: '',
    pin_code: '',
    brand: '',
    electrician_mobile: '',
    godown: '',
    contact_person: '',
    dealer_mobile: '',
    remark: ''
  });
  const [filters, setFilters] = useState({
    user_type: '',
    status: '',
    city: '',
    search: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await usersAPI.getAll(params);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        userID: user.userID || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        dob: user.dob || '',
        m_number: user.m_number || '',
        gender: user.gender || 'Male',
        user_type: user.user_type || 'regular_user',
        country_code: user.country_code || 91,
        email: user.email || '',
        password: '',
        city: user.city || '',
        status: user.status !== undefined ? user.status : 0,
        address: user.address || '',
        pin_code: user.pin_code || '',
        brand: user.brand || '',
        electrician_mobile: user.electrician_mobile || '',
        godown: user.godown || '',
        contact_person: user.contact_person || '',
        dealer_mobile: user.dealer_mobile || '',
        remark: user.remark || ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        userID: '',
        first_name: '',
        last_name: '',
        dob: '',
        m_number: '',
        gender: 'Male',
        user_type: 'regular_user',
        country_code: 91,
        email: '',
        password: '',
        city: '',
        status: 0,
        address: '',
        pin_code: '',
        brand: '',
        electrician_mobile: '',
        godown: '',
        contact_person: '',
        dealer_mobile: '',
        remark: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      // Remove empty password if editing
      if (selectedUser && !dataToSend.password) {
        delete dataToSend.password;
      }
      // Remove empty fields
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === null) {
          delete dataToSend[key];
        }
      });

      if (selectedUser) {
        await usersAPI.update(selectedUser.id, dataToSend);
        alert('User updated successfully!');
      } else {
        await usersAPI.create(dataToSend);
        alert('User created successfully!');
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await usersAPI.delete(selectedUser.id);
      alert('User deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { label: 'Active', class: 'status-active' },
      1: { label: 'Inactive', class: 'status-inactive' },
      2: { label: 'Suspended', class: 'status-suspended' },
    };
    const statusInfo = statusMap[status] || statusMap[0];
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h2>Users Management</h2>
        <Link 
          to="/users/new"
          className="btn-primary"
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          Add New User
        </Link>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search users..."
          className="filter-input"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select
          className="filter-select"
          value={filters.user_type}
          onChange={(e) => handleFilterChange('user_type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="regular_user">Regular User</option>
          <option value="electrician">Electrician</option>
          <option value="dealer">Dealer</option>
        </select>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="0">Active</option>
          <option value="1">Inactive</option>
          <option value="2">Suspended</option>
        </select>
        <input
          type="text"
          placeholder="City"
          className="filter-input"
          value={filters.city}
          onChange={(e) => handleFilterChange('city', e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Type</th>
                <th>City</th>
                <th>Points</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.m_number}</td>
                    <td>{user.email || '-'}</td>
                    <td><span className="badge">{user.user_type_name}</span></td>
                    <td>{user.city || '-'}</td>
                    <td>{parseFloat(user.points || 0).toFixed(2)}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      <button className="btn-action" onClick={() => navigate(`/users/${user.id}/edit`)}>Edit</button>
                      <button className="btn-action btn-danger" onClick={() => handleDeleteClick(user)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label>User ID *</label>
              <input
                type="number"
                name="userID"
                value={formData.userID}
                onChange={handleInputChange}
                required
              />
            </div>
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
              <label>Mobile Number *</label>
              <input
                type="text"
                name="m_number"
                value={formData.m_number}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>User Type *</label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleInputChange}
                required
              >
                <option value="regular_user">Regular User</option>
                <option value="electrician">Electrician</option>
                <option value="dealer">Dealer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value={0}>Active</option>
                <option value={1}>Inactive</option>
                <option value={2}>Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Pin Code</label>
              <input
                type="text"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Password {!selectedUser && '*'}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!selectedUser}
                placeholder={selectedUser ? "Leave empty to keep current" : ""}
              />
            </div>
          </div>

          {formData.user_type === 'electrician' && (
            <div className="form-row">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Electrician Mobile</label>
                <input
                  type="text"
                  name="electrician_mobile"
                  value={formData.electrician_mobile}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </div>
          )}

          {formData.user_type === 'dealer' && (
            <div className="form-row">
              <div className="form-group">
                <label>Godown</label>
                <input
                  type="text"
                  name="godown"
                  value={formData.godown}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Dealer Mobile</label>
                <input
                  type="text"
                  name="dealer_mobile"
                  value={formData.dealer_mobile}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {formData.user_type === 'dealer' && (
            <div className="form-row">
              <div className="form-group full-width">
                <label>Remark</label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
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
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.first_name} ${selectedUser?.last_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Users;
