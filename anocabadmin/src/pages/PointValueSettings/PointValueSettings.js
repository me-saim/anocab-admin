import React, { useEffect, useState } from 'react';
import { pointValueSettingsAPI } from '../../services/api';
import { useDialog } from '../../components/DialogProvider/DialogProvider';
import './PointValueSettings.css';

const PointValueSettings = () => {
  const dialog = useDialog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ points: '10', rupees: '1' });

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    setLoading(true);
    try {
      const response = await pointValueSettingsAPI.getActive();
      const setting = response.data?.setting;

      if (setting) {
        setFormData({
          points: String(setting.points ?? '10'),
          rupees: String(setting.rupees ?? '1'),
        });
      }
    } catch (error) {
      console.error('Error fetching point value settings:', error);
      await dialog.alert('Error fetching point value settings: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const points = Number.parseInt(String(formData.points), 10);
      const rupees = Number(formData.rupees);

      if (!Number.isFinite(points) || points <= 0) {
        await dialog.alert('Points must be a positive integer.');
        return;
      }
      if (!Number.isFinite(rupees) || rupees <= 0) {
        await dialog.alert('Rupees must be a positive number.');
        return;
      }

      let created_by = null;
      try {
        const admin = JSON.parse(localStorage.getItem('admin') || 'null');
        if (admin?.id) created_by = admin.id;
      } catch {
        created_by = null;
      }

      await pointValueSettingsAPI.update({ points, rupees, created_by });
      await dialog.alert('Point value settings updated successfully!');
      await fetchSetting();
    } catch (error) {
      console.error('Error updating point value settings:', error);
      await dialog.alert('Error updating point value settings: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="point-value-settings-page">
        <div className="form-container">
          <h2>Point Value Settings</h2>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="point-value-settings-page">
      <div className="form-container">
        <div className="form-header">
          <h2>Point Value Settings</h2>
        </div>

        <form onSubmit={handleSubmit} className="point-value-settings-form">
          <div className="form-section">
            <h3>Conversion</h3>
            <p className="helper-text">
              Example: set <b>10</b> points = <b>1</b> rupee.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>Points *</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Rupees *</label>
                <input
                  type="number"
                  name="rupees"
                  value={formData.rupees}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PointValueSettings;

