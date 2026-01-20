import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { calculatorDataAPI } from '../../services/api';
import './CalculatorDataForm.css';

const CalculatorDataForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    value: '',
    unit: '',
    description: '',
    status: 1
  });

  useEffect(() => {
    if (id) {
      fetchCalculatorData();
    }
  }, [id]);

  const fetchCalculatorData = async () => {
    try {
      const response = await calculatorDataAPI.getById(id);
      const item = response.data;
      setFormData({
        category: item.category || '',
        name: item.name || '',
        value: item.value || '',
        unit: item.unit || '',
        description: item.description || '',
        status: item.status !== undefined ? item.status : 1
      });
    } catch (error) {
      console.error('Error fetching calculator data:', error);
      alert('Error fetching calculator data: ' + (error.message || 'Unknown error'));
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
      if (dataToSend.value) {
        dataToSend.value = parseFloat(dataToSend.value);
      } else {
        dataToSend.value = null;
      }

      if (id) {
        await calculatorDataAPI.update(id, dataToSend);
        alert('Calculator data updated successfully!');
      } else {
        await calculatorDataAPI.create(dataToSend);
        alert('Calculator data created successfully!');
      }
      navigate('/calculator-data');
    } catch (error) {
      console.error('Error saving calculator data:', error);
      alert('Error saving calculator data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator-data-form-page">
      <div className="form-container">
        <div className="form-header">
          <h2>{id ? 'Edit Calculator Data' : 'Add New Calculator Data'}</h2>
          <button type="button" className="btn-back" onClick={() => navigate('/calculator-data')}>
            ← Back to Calculator Data
          </button>
        </div>

        <form onSubmit={handleSubmit} className="calculator-data-form">
          <div className="form-section">
            <h3>Calculator Data Information</h3>
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

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter description..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/calculator-data')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update Data' : 'Create Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalculatorDataForm;
