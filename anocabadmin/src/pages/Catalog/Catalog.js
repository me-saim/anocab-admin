import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { catalogAPI } from '../../services/api';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useDialog } from '../../components/DialogProvider/DialogProvider';
import './Catalog.css';

const Catalog = () => {
  const navigate = useNavigate();
  const dialog = useDialog();
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    file_type: 'pdf',
    file_size: '',
    status: 1
  });

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      const response = await catalogAPI.getAll();
      setCatalogs(response.data);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      await dialog.alert('Error fetching catalogs: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (catalog = null) => {
    if (catalog) {
      setSelectedCatalog(catalog);
      setFormData({
        title: catalog.title || '',
        link: catalog.link || '',
        file_type: catalog.file_type || 'pdf',
        file_size: catalog.file_size || '',
        status: catalog.status !== undefined ? catalog.status : 1
      });
    } else {
      setSelectedCatalog(null);
      setFormData({
        title: '',
        link: '',
        file_type: 'pdf',
        file_size: '',
        status: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCatalog(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      const admin = JSON.parse(localStorage.getItem('admin') || '{}');
      if (!selectedCatalog) {
        dataToSend.created_by = admin.id;
      }
      if (dataToSend.file_size) {
        dataToSend.file_size = parseInt(dataToSend.file_size);
      }

      if (selectedCatalog) {
        await catalogAPI.update(selectedCatalog.id, dataToSend);
        await dialog.alert('Catalog updated successfully!');
      } else {
        await catalogAPI.create(dataToSend);
        await dialog.alert('Catalog created successfully!');
      }
      handleCloseModal();
      fetchCatalogs();
    } catch (error) {
      console.error('Error saving catalog:', error);
      await dialog.alert('Error saving catalog: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteClick = (catalog) => {
    setSelectedCatalog(catalog);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await catalogAPI.delete(selectedCatalog.id);
      await dialog.alert('Catalog deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedCatalog(null);
      fetchCatalogs();
    } catch (error) {
      console.error('Error deleting catalog:', error);
      await dialog.alert('Error deleting catalog: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="catalog-page">
      <div className="page-header">
        <h2>Catalog Management</h2>
        <Link to="/catalog/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Add New Catalog</Link>
      </div>

      {loading ? (
        <div className="loading">Loading catalogs...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>File Type</th>
                <th>File Size</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {catalogs.length > 0 ? (
                catalogs.map((catalog) => (
                  <tr key={catalog.id}>
                    <td>{catalog.id}</td>
                    <td className="title-cell">{catalog.title}</td>
                    <td><span className="badge">{catalog.file_type || 'pdf'}</span></td>
                    <td>{catalog.file_size ? `${(catalog.file_size / 1024).toFixed(2)} KB` : '-'}</td>
                    <td>
                      <span className={`badge ${catalog.status === 1 ? 'status-active' : 'status-inactive'}`}>
                        {catalog.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{catalog.created_by_name || '-'}</td>
                    <td>{new Date(catalog.created_at).toLocaleDateString()}</td>
                    <td>
                      <a href={catalog.link} target="_blank" rel="noopener noreferrer" className="btn-action">View</a>
                      <button className="btn-action" onClick={() => navigate(`/catalog/${catalog.id}/edit`)}>Edit</button>
                      <button className="btn-action btn-danger" onClick={() => handleDeleteClick(catalog)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">No catalogs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCatalog ? 'Edit Catalog' : 'Add New Catalog'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="catalog-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
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
          setSelectedCatalog(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Catalog"
        message={`Are you sure you want to delete catalog "${selectedCatalog?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Catalog;
