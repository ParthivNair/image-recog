import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './SettingsPanel.css';

function SettingsPanel({ isActive }) {
  const [settings, setSettings] = useState({
    min_area: 1500,
    min_circularity: 0.5,
    min_solidity: 0.7
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (param, value) => {
    setSettings(prev => ({ ...prev, [param]: parseFloat(value) }));
  };

  const applySettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/config/sensitivity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings applied successfully!');
      }
    } catch (error) {
      console.error('Error applying settings:', error);
      alert('Failed to apply settings');
    }
  };

  const resetDefaults = () => {
    setSettings({
      min_area: 1500,
      min_circularity: 0.5,
      min_solidity: 0.7
    });
  };

  return (
    <div className="settings-panel">
      <div className="settings-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>⚙️ Detection Settings</h3>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      
      {isExpanded && (
        <div className="settings-content">
          <div className="setting-item">
            <label>
              Min Area (pixels): <strong>{settings.min_area}</strong>
              <span className="setting-help">Minimum object size</span>
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={settings.min_area}
              onChange={(e) => handleChange('min_area', e.target.value)}
              className="slider"
            />
          </div>

          <div className="setting-item">
            <label>
              Min Circularity: <strong>{settings.min_circularity.toFixed(2)}</strong>
              <span className="setting-help">How round (1.0 = perfect circle)</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.min_circularity}
              onChange={(e) => handleChange('min_circularity', e.target.value)}
              className="slider"
            />
          </div>

          <div className="setting-item">
            <label>
              Min Solidity: <strong>{settings.min_solidity.toFixed(2)}</strong>
              <span className="setting-help">How compact/filled (higher = more solid)</span>
            </label>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={settings.min_solidity}
              onChange={(e) => handleChange('min_solidity', e.target.value)}
              className="slider"
            />
          </div>

          <div className="settings-actions">
            <button onClick={applySettings} className="apply-button">
              Apply Settings
            </button>
            <button onClick={resetDefaults} className="reset-button">
              Reset Defaults
            </button>
          </div>

          <div className="settings-info">
            <p><strong>Tips for better detection:</strong></p>
            <ul>
              <li>Increase <strong>Min Area</strong> to ignore small objects</li>
              <li>Increase <strong>Circularity</strong> to detect only round objects (apples, balls)</li>
              <li>Increase <strong>Solidity</strong> to reject hands and irregular shapes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;

