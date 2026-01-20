import React, { useEffect, useState } from 'react';
import { qrScansAPI } from '../../services/api';
import './QRScans.css';

const QRScans = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await qrScansAPI.getAll();
      setScans(response.data);
    } catch (error) {
      console.error('Error fetching QR scans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qrscans-page">
      <div className="page-header">
        <h2>QR Scans History</h2>
      </div>

      {loading ? (
        <div className="loading">Loading QR scans...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Mobile</th>
                <th>QR Code</th>
                <th>QR Points</th>
                <th>Points Awarded</th>
                <th>Scanned At</th>
              </tr>
            </thead>
            <tbody>
              {scans.length > 0 ? (
                scans.map((scan) => (
                  <tr key={scan.id}>
                    <td>{scan.id}</td>
                    <td>{scan.first_name} {scan.last_name}</td>
                    <td>{scan.m_number}</td>
                    <td className="code-cell">{scan.code}</td>
                    <td>{parseFloat(scan.qr_points || 0).toFixed(2)}</td>
                    <td>{parseFloat(scan.points_awarded || 0).toFixed(2)}</td>
                    <td>{new Date(scan.scanned_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No QR scans found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QRScans;
