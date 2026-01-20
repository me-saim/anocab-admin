import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { catalogAPI } from '../../services/api';
import './CatalogForm.css';

const CatalogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    file_type: 'pdf',
    file_size: '',
    status: 1
  });

  useEffect(() => {
    if (id) {
      fetchCatalog();
    }
  }, [id]);

  const fetchCatalog = async () => {
    try {
      const response = await catalogAPI.getById(id);
      const catalog = response.data;
      setFormData({
        title: catalog.title || '',
        link: catalog.link || '',
        file_type: catalog.file_type || 'pdf',
        file_size: catalog.file_size || '',
        status: catalog.status !== undefined ? catalog.status : 1
      });
    } catch (error) {
      console.error('Error fetching catalog:', error);
      alert('Error fetching catalog: ' + (error.message || 'Unknown error'));
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
      const admin = JSON.parse(localStorage.getItem('admin') || '{}');
      if (!id) {
        dataToSend.created_by = admin.id;
      }
      if (dataToSend.file_size) {
        dataToSend.file_size = parseInt(dataToSend.file_size);
      }

      if (id) {
        await catalogAPI.update(id, dataToSend);
        alert('Catalog updated successfully!');
      } else {
        await catalogAPI.create(dataToSend);
        alert('Catalog created successfully!');
      }
      navigate('/catalog');
    } catch (error) {
      console.error('Error saving catalog:', error);
      alert('Error saving catalog: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="catalog-form-page">
      <div className="form-container">
        <div className="form-header">
          <h2>{id ? 'Edit Catalog' : 'Add New Catalog'}</h2>
          <button type="button" className="btn-back" onClick={() => navigate('/catalog')}>
            ← Back to Catalog
          </button>
        </div>

        <form onSubmit={handleSubmit} className="catalog-form">
          <div className="form-section">
            <h3>Catalog Information</h3>
            <div className="form-group full-width">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter catalog title"
              />
            </div>

            <div className="form-group full-width">
              <label>Link/URL *</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                required
                placeholder="https://example.com/catalog.pdf"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>File Type</label>
                <select
                  name="file_type"
                  value={formData.file_type}
                  onChange={handleInputChange}
                >
                  <option value="pdf">PDF</option>
                  <option value="doc">DOC</option>
                  <option value="docx">DOCX</option>
                  <option value="xls">XLS</option>
                  <option value="xlsx">XLSX</option>
                </select>
              </div>
              <div className="form-group">
                <label>File Size (bytes)</label>
                <input
                  type="number"
                  name="file_size"
                  value={formData.file_size}
                  onChange={handleInputChange}
                  placeholder="1024"
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
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/catalog')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update Catalog' : 'Create Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CatalogForm;
