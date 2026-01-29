import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qrCodesAPI } from '../../services/api';
import jsPDF from 'jspdf';
import { useDialog } from '../../components/DialogProvider/DialogProvider';
import './QRCodeView.css';

const QRCodeView = () => {
  const { ids } = useParams();
  const navigate = useNavigate();
  const dialog = useDialog();
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productInfo, setProductInfo] = useState(null);

  useEffect(() => {
    if (ids) {
      fetchQRCodes();
    }
  }, [ids]);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const idArray = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      if (idArray.length === 0) {
        await dialog.alert('Invalid QR code IDs');
        navigate('/qr-codes');
        return;
      }

      const promises = idArray.map(id => qrCodesAPI.getById(id));
      const responses = await Promise.all(promises);
      const codes = responses.map(res => res.data);
      
      setQrCodes(codes);
      if (codes.length > 0) {
        setProductInfo({
          product: codes[0].product,
          details: codes[0].details,
          points: codes[0].points
        });
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      await dialog.alert('Error fetching QR codes: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeImage = (code) => {
    if (!code) return null;
    return `https://quickchart.io/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(code)}`;
  };

  const downloadAllAsPDF = async () => {
    if (qrCodes.length === 0) return;

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
      if (productInfo) {
        pdf.setFontSize(12);
        pdf.text(`Product: ${productInfo.product}`, margin, y);
        y += 5;
        if (productInfo.details) {
          const detailsLines = pdf.splitTextToSize(`Details: ${productInfo.details}`, pageWidth - 2 * margin);
          pdf.text(detailsLines, margin, y);
          y += detailsLines.length * 5 + 5;
        }
        pdf.text(`Reward Points: ${parseFloat(productInfo.points || 0).toFixed(2)}`, margin, y);
        y += 10;
      }

      // Load all images first
      const imagePromises = qrCodes.map((qr) => {
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

      const fileName = productInfo 
        ? `qr-codes-${productInfo.product}-${Date.now()}.pdf`
        : `qr-codes-${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      await dialog.alert('Error generating PDF: ' + (error.message || 'Unknown error'));
    }
  };

  const downloadSingle = (qr) => {
    const link = document.createElement('a');
    link.href = generateQRCodeImage(qr.code);
    link.download = `qr-code-${qr.code}.png`;
    link.click();
  };

  const printPage = () => {
    window.print();
  };

  if (loading) {
    return <div className="qr-view-page"><div className="loading">Loading QR codes...</div></div>;
  }

  return (
    <div className="qr-view-page">
      <div className="qr-view-container">
        <div className="qr-view-header">
          <h2>QR Codes - Shareable View</h2>
          <div className="header-actions">
            <button className="btn-primary" onClick={downloadAllAsPDF}>
              Download All as PDF
            </button>
            <button className="btn-primary" onClick={printPage}>
              Print
            </button>
            <button className="btn-cancel" onClick={() => navigate('/qr-codes')}>
              Back to List
            </button>
          </div>
        </div>

        {productInfo && (
          <div className="product-info">
            <h3>{productInfo.product}</h3>
            <p>{productInfo.details}</p>
            <p><strong>Reward Points:</strong> {parseFloat(productInfo.points || 0).toFixed(2)}</p>
          </div>
        )}

        <div className="qr-codes-grid">
          {qrCodes.map((qr) => (
            <div key={qr.id} className="qr-code-card">
              <div className="qr-code-image-container">
                <img 
                  src={generateQRCodeImage(qr.code)} 
                  alt={`QR Code ${qr.id}`}
                  className="qr-code-image"
                />
              </div>
              <div className="qr-code-info">
                <p className="qr-code-id">ID: {qr.id}</p>
                <p className="qr-code-string">{qr.code}</p>
                <button
                  className="btn-download"
                  onClick={() => downloadSingle(qr)}
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="share-info">
          <p>Share this page URL to allow others to view and download these QR codes.</p>
          <p className="share-url">{window.location.href}</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeView;
