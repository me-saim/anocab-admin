import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogsAPI, uploadAPI } from '../../services/api';
import './BlogForm.css';

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    img: '',
    type: 1,
    status: 1
  });

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await blogsAPI.getById(id);
      const blog = response.data;
      setFormData({
        title: blog.title || '',
        description: blog.description || '',
        img: blog.img || '',
        type: blog.type || 1,
        status: blog.status !== undefined ? blog.status : 1
      });
      if (blog.img) {
        setPreviewUrl(blog.img);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      alert('Error fetching blog: ' + (error.message || 'Unknown error'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      return null;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await uploadAPI.uploadImage(formData);
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error.message || 'Unknown error'));
      return null;
    } finally {
      setUploading(false);
    }
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

      // Upload image if a new file is selected
      if (selectedFile) {
        const imageUrl = await handleUploadImage();
        if (imageUrl) {
          dataToSend.img = imageUrl;
        } else {
          setLoading(false);
          return; // Stop if upload failed
        }
      }

      if (id) {
        await blogsAPI.update(id, dataToSend);
        alert('Blog updated successfully!');
      } else {
        await blogsAPI.create(dataToSend);
        alert('Blog created successfully!');
      }
      navigate('/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-form-page">
      <div className="form-container">
        <div className="form-header">
          <h2>{id ? 'Edit Blog' : 'Add New Blog'}</h2>
          <button type="button" className="btn-back" onClick={() => navigate('/blogs')}>
            ← Back to Blogs
          </button>
        </div>

        <form onSubmit={handleSubmit} className="blog-form">
          <div className="form-section">
            <h3>Blog Information</h3>
            <div className="form-group full-width">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter blog title"
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="8"
                placeholder="Enter blog description/content"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Image Upload</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', width: '100%' }}
                />
                {previewUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #e0e0e0', padding: '5px', borderRadius: '4px' }}
                    />
                  </div>
                )}
                {formData.img && !selectedFile && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Current: <a href={formData.img} target="_blank" rel="noopener noreferrer">{formData.img}</a>
                  </div>
                )}
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
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/blogs')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading || uploading}>
              {uploading ? 'Uploading...' : loading ? 'Saving...' : id ? 'Update Blog' : 'Create Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
