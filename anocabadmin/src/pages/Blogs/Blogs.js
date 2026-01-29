import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { blogsAPI } from '../../services/api';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useDialog } from '../../components/DialogProvider/DialogProvider';
import './Blogs.css';

const Blogs = () => {
  const navigate = useNavigate();
  const dialog = useDialog();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    img: '',
    type: 1,
    status: 1
  });
  const [filters, setFilters] = useState({ type: '', status: '', search: '' });

  useEffect(() => {
    fetchBlogs();
  }, [filters]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await blogsAPI.getAll(params);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      await dialog.alert('Error fetching blogs: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setSelectedBlog(blog);
      setFormData({
        title: blog.title || '',
        description: blog.description || '',
        img: blog.img || '',
        type: blog.type || 1,
        status: blog.status !== undefined ? blog.status : 1
      });
    } else {
      setSelectedBlog(null);
      setFormData({
        title: '',
        description: '',
        img: '',
        type: 1,
        status: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      // Get admin from localStorage
      const admin = JSON.parse(localStorage.getItem('admin') || '{}');
      if (!selectedBlog) {
        dataToSend.created_by = admin.id;
      }

      if (selectedBlog) {
        await blogsAPI.update(selectedBlog.id, dataToSend);
        await dialog.alert('Blog updated successfully!');
      } else {
        await blogsAPI.create(dataToSend);
        await dialog.alert('Blog created successfully!');
      }
      handleCloseModal();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      await dialog.alert('Error saving blog: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteClick = (blog) => {
    setSelectedBlog(blog);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await blogsAPI.delete(selectedBlog.id);
      await dialog.alert('Blog deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedBlog(null);
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      await dialog.alert('Error deleting blog: ' + (error.message || 'Unknown error'));
    }
  };

  const getTypeLabel = (type) => {
    const types = { 1: 'News', 2: 'Blog', 3: 'Event' };
    return types[type] || 'Unknown';
  };

  return (
    <div className="blogs-page">
      <div className="page-header">
        <h2>Blogs Management</h2>
        <Link to="/blogs/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Add New Blog</Link>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search blogs..."
          className="filter-input"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="filter-select"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="1">News</option>
          <option value="2">Blog</option>
          <option value="3">Event</option>
        </select>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="1">Published</option>
          <option value="0">Draft</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading blogs...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Views</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>{blog.id}</td>
                    <td className="title-cell">{blog.title}</td>
                    <td><span className="badge">{getTypeLabel(blog.type)}</span></td>
                    <td>
                      <span className={`badge ${blog.status === 1 ? 'status-active' : 'status-inactive'}`}>
                        {blog.status === 1 ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{blog.views || 0}</td>
                    <td>{blog.created_by_name || '-'}</td>
                    <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-action" onClick={() => navigate(`/blogs/${blog.id}/edit`)}>Edit</button>
                      <button className="btn-action btn-danger" onClick={() => handleDeleteClick(blog)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">No blogs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedBlog ? 'Edit Blog' : 'Add New Blog'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="blog-form">
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
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="img"
                value={formData.img}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value={1}>News</option>
                <option value={2}>Blog</option>
                <option value={3}>Event</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value={1}>Published</option>
                <option value={0}>Draft</option>
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
          setSelectedBlog(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Blog"
        message={`Are you sure you want to delete blog "${selectedBlog?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Blogs;
