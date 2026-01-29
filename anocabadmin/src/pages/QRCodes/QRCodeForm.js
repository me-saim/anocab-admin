import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { qrCodesAPI } from '../../services/api';
import jsPDF from 'jspdf';
import { useDialog } from '../../components/DialogProvider/DialogProvider';
import './QRCodeForm.css';

const QRCodeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dialog = useDialog();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    details: '',
    points: 0,
    expires_at: '',
    quantity: 1
  });
  const [generatedQRCodes, setGeneratedQRCodes] = useState([]);

  useEffect(() => {
    if (id) {
      fetchQRCode();
    }
  }, [id]);

  const fetchQRCode = async () => {
    try {
      const response = await qrCodesAPI.getById(id);
      const qr = response.data;
      setFormData({
        product: qr.product || '',
        details: qr.details || '',
        points: qr.points || 0,
        expires_at: qr.expires_at ? qr.expires_at.split('T')[0] : ''
      });
      if (qr.code) {
        setGeneratedQRCodes([{ id: qr.id, code: qr.code }]);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      await dialog.alert('Error fetching QR code: ' + (error.message || 'Unknown error'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generateQRCodeImage = (code) => {
    if (!code) return null;
    return `https://quickchart.io/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(code)}`;
  };

  const downloadAllAsPDF = async () => {
    if (generatedQRCodes.length === 0) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const qrSize = 40; // Size of QR code in mm
      const spacing = 5;
      const codesPerRow = 4;
      const codesPerPage = 12;
      
      let x = margin;
      let y = margin + 10;
      let count = 0;

      // Add title
      pdf.setFontSize(16);
      pdf.text('QR Codes', pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Add product info if available
      if (formData.product) {
        pdf.setFontSize(12);
        pdf.text(`Product: ${formData.product}`, margin, y);
        y += 5;
        if (formData.details) {
          const detailsLines = pdf.splitTextToSize(`Details: ${formData.details}`, pageWidth - 2 * margin);
          pdf.text(detailsLines, margin, y);
          y += detailsLines.length * 5 + 5;
        }
        pdf.text(`Reward Points: ${parseFloat(formData.points || 0).toFixed(2)}`, margin, y);
        y += 10;
      }

      // Load all images first
      const imagePromises = generatedQRCodes.map((qr) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // Convert image to base64
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/png');
            resolve({ qr, imgData });
          };
          img.onerror = () => {
            // If image fails to load, create a placeholder
            resolve({ qr, imgData: null });
          };
          img.src = generateQRCodeImage(qr.code);
        });
      });

      const images = await Promise.all(imagePromises);

      // Add images to PDF
      for (let i = 0; i < images.length; i++) {
        const { qr, imgData } = images[i];
        
        if (count > 0 && count % codesPerPage === 0) {
          pdf.addPage();
          x = margin;
          y = margin;
        }

        if (count > 0 && count % codesPerRow === 0) {
          x = margin;
          y += qrSize + spacing + 15; // Extra space for text
        }

        if (imgData) {
          try {
            pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
          } catch (err) {
            console.error(`Error adding image to PDF for QR ${qr.id}:`, err);
          }
        }
        
        // Add ID and code text below QR
        pdf.setFontSize(8);
        pdf.text(`ID: ${qr.id}`, x, y + qrSize + 3);
        const codeText = pdf.splitTextToSize(qr.code, qrSize);
        pdf.text(codeText, x, y + qrSize + 6);
        
        x += qrSize + spacing;
        count++;
      }

      const fileName = `qr-codes-${formData.product || 'all'}-${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      await dialog.alert('Error generating PDF: ' + (error.message || 'Unknown error'));
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
      dataToSend.points = parseFloat(dataToSend.points) || 0;
      if (dataToSend.expires_at) {
        dataToSend.expires_at = new Date(dataToSend.expires_at).toISOString();
      } else {
        delete dataToSend.expires_at;
      }

      if (id) {
        await qrCodesAPI.update(id, dataToSend);
        await dialog.alert('QR code updated successfully!');
        navigate('/qr-codes');
      } else {
        const quantity = parseInt(dataToSend.quantity) || 1;
        dataToSend.quantity = quantity;
        const response = await qrCodesAPI.create(dataToSend);
        if (response.data && response.data.codes) {
          setGeneratedQRCodes(response.data.codes);
          await dialog.alert(`${quantity} QR code(s) created successfully! You can view and download them below.`);
        } else {
          await dialog.alert('QR code created successfully!');
          navigate('/qr-codes');
        }
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      await dialog.alert('Error saving QR code: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qrcode-form-page">
      <div className="form-container">
        <div className="form-header">
          <h2>{id ? 'Edit QR Code' : 'Add New QR Code'}</h2>
          <button type="button" className="btn-back" onClick={() => navigate('/qr-codes')}>
            ← Back to QR Codes
          </button>
        </div>

        <form onSubmit={handleSubmit} className="qrcode-form">
          <div className="form-section">
            <h3>Product Information</h3>
            <div className="form-group full-width">
              <label>Product Name *</label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group full-width">
              <label>Product Details *</label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Enter product details"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Reward Points *</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="1000"
                  placeholder="1"
                  disabled={!!id}
                />
                {!id && <small style={{ color: '#666', fontSize: '12px' }}>Generate multiple QR codes (1-1000)</small>}
              </div>
              <div className="form-group">
                <label>Expires At</label>
                <input
                  type="date"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {generatedQRCodes.length > 0 && (
            <div className="form-section">
              <h3>Generated QR Codes ({generatedQRCodes.length})</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={downloadAllAsPDF}
                >
                  Download All as PDF
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/qr-codes/view/${generatedQRCodes.map(qr => qr.id).join(',')}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        dialog.alert('Shareable link copied to clipboard!');
                      }).catch(() => {
                        dialog.alert('Unable to copy automatically. Please copy this link:\n\n' + shareUrl);
                      });
                    } else {
                      dialog.alert('Please copy this link:\n\n' + shareUrl);
                    }
                  }}
                >
                  Copy Shareable Link
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/qr-codes')}
                >
                  Back to List
                </button>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '20px',
                maxHeight: '500px',
                overflowY: 'auto',
                padding: '10px'
              }}>
                {generatedQRCodes.map((qr) => (
                  <div key={qr.id} style={{ 
                    textAlign: 'center', 
                    padding: '15px', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <img 
                      src={generateQRCodeImage(qr.code)} 
                      alt={`QR Code ${qr.id}`}
                      style={{ 
                        width: '100%', 
                        maxWidth: '200px', 
                        height: 'auto',
                        border: '1px solid #e0e0e0', 
                        padding: '5px', 
                        backgroundColor: '#fff',
                        marginBottom: '10px'
                      }}
                    />
                    <p style={{ fontSize: '10px', color: '#666', margin: '5px 0', wordBreak: 'break-all' }}>
                      ID: {qr.id}
                    </p>
                    <p style={{ fontSize: '10px', color: '#666', margin: '5px 0', wordBreak: 'break-all' }}>
                      {qr.code}
                    </p>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generateQRCodeImage(qr.code);
                        link.download = `qr-code-${qr.code}.png`;
                        link.click();
                      }}
                      style={{ marginTop: '5px', fontSize: '12px', padding: '5px 10px' }}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/qr-codes')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update QR Code' : 'Create QR Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QRCodeForm;
