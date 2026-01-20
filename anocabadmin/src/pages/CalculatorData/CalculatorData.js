import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { calculatorDataAPI } from '../../services/api';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import './CalculatorData.css';

const CalculatorData = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    value: '',
    unit: '',
    description: '',
    status: 1
  });
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await calculatorDataAPI.getAll(params);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching calculator data:', error);
      alert('Error fetching calculator data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        category: item.category || '',
        name: item.name || '',
        value: item.value || '',
        unit: item.unit || '',
        description: item.description || '',
        status: item.status !== undefined ? item.status : 1
      });
    } else {
      setSelectedItem(null);
      setFormData({
        category: '',
        name: '',
        value: '',
        unit: '',
        description: '',
        status: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (dataToSend.value) {
        dataToSend.value = parseFloat(dataToSend.value);
      } else {
        dataToSend.value = null;
      }

      if (selectedItem) {
        await calculatorDataAPI.update(selectedItem.id, dataToSend);
        alert('Calculator data updated successfully!');
      } else {
        await calculatorDataAPI.create(dataToSend);
        alert('Calculator data created successfully!');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving calculator data:', error);
      alert('Error saving calculator data: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await calculatorDataAPI.delete(selectedItem.id);
      alert('Calculator data deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting calculator data:', error);
      alert('Error deleting calculator data: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="calculator-data-page">
      <div className="page-header">
        <h2>Calculator Data Management</h2>
        <Link to="/calculator-data/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Add New Data</Link>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          className="filter-input"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          className="filter-input"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading calculator data...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Name</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td><span className="badge">{item.category}</span></td>
                    <td>{item.name}</td>
                    <td>{item.value !== null ? parseFloat(item.value).toFixed(4) : '-'}</td>
                    <td>{item.unit || '-'}</td>
                    <td className="description-cell">{item.description || '-'}</td>
                    <td>
                      <span className={`badge ${item.status === 1 ? 'status-active' : 'status-inactive'}`}>
                        {item.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-action" onClick={() => navigate(`/calculator-data/${item.id}/edit`)}>Edit</button>
                      <button className="btn-action btn-danger" onClick={() => handleDeleteClick(item)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">No calculator data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? 'Edit Calculator Data' : 'Add New Calculator Data'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="calculator-form">
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                placeholder="e.g., Voltage, Current"
              />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Value</label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                step="0.0001"
                placeholder="0.0000"
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="e.g., V, A, W"
              />
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

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter description..."
            />
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
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Calculator Data"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CalculatorData;
