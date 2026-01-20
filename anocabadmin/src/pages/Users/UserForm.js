import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import './UserForm.css';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await usersAPI.getById(id);
      const user = response.data;
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
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Error fetching user: ' + (error.message || 'Unknown error'));
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
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === null) {
          delete dataToSend[key];
        }
      });

      if (id) {
        await usersAPI.update(id, dataToSend);
        alert('User updated successfully!');
      } else {
        await usersAPI.create(dataToSend);
        alert('User created successfully!');
      }
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form-page">
      <div className="form-container">
        <div className="form-header">
          <h2>{id ? 'Edit User' : 'Add New User'}</h2>
          <button type="button" className="btn-back" onClick={() => navigate('/users')}>
            ← Back to Users
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-section">
            <h3>Basic Information</h3>
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
          </div>

          <div className="form-section">
            <h3>Location & Contact</h3>
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
            </div>

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

          {formData.user_type === 'electrician' && (
            <div className="form-section">
              <h3>Electrician Details</h3>
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
              </div>
            </div>
          )}

          {formData.user_type === 'dealer' && (
            <div className="form-section">
              <h3>Dealer Details</h3>
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

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/users')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
