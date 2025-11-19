import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './StatusPanel.css';

function StatusPanel({ isActive, onPositionUpdate }) {
  const [status, setStatus] = useState({
    current_target_color: 'red',
    last_detected: false,
    last_rel_x: null,
    last_rel_y: null
  });
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (!isActive) {
      // Reset status when inactive
      setStatus(prev => ({
        current_target_color: prev.current_target_color,
        last_detected: false,
        last_rel_x: null,
        last_rel_y: null
      }));
      setFps(0);
      setFrameCount(0);
      return;
    }

    let fpsTimer = Date.now();
    let count = 0;

    // Poll status much faster for real-time updates (every 50ms = ~20Hz)
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
          
          // Update position for path tracker
          if (data.last_detected && data.last_rel_x !== null && data.last_rel_y !== null) {
            onPositionUpdate({ x: data.last_rel_x, y: data.last_rel_y });
          }

          // Calculate FPS
          count++;
          const now = Date.now();
          const elapsed = (now - fpsTimer) / 1000;
          
          if (elapsed >= 1) {
            setFps(Math.round(count / elapsed));
            fpsTimer = now;
            count = 0;
          }
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    }, 50); // 50ms = 20Hz update rate

    return () => clearInterval(interval);
  }, [isActive, onPositionUpdate]);

  return (
    <div className="status-panel">
      <h3>Detection Status {isActive && <span className="fps-badge">{fps} Hz</span>}</h3>
      {!isActive && (
        <div className="inactive-notice">
          Detection is currently stopped
        </div>
      )}
      <div className={`status-grid ${!isActive ? 'dimmed' : ''}`}>
        <div className="status-item">
          <span className="status-label">Current Target:</span>
          <span className="status-value target-color">
            {status.current_target_color} blob
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Detected:</span>
          <span className={`status-value ${status.last_detected ? 'detected-yes' : 'detected-no'}`}>
            {status.last_detected ? 'YES' : 'NO'}
          </span>
        </div>

        {status.last_detected && status.last_rel_x !== null && status.last_rel_y !== null && (
          <div className="status-item full-width">
            <span className="status-label">Position:</span>
            <span className="status-value position-coords">
              X: {status.last_rel_x.toFixed(3)} | Y: {status.last_rel_y.toFixed(3)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusPanel;

