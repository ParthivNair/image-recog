import { useState, useCallback } from 'react';
import VideoPanel from './components/VideoPanel';
import ControlPanel from './components/ControlPanel';
import './App.css';

const MAX_TRAIL_LENGTH = 150; // Keep last 150 positions (~7.5 seconds at 20Hz)

function App() {
  const [isActive, setIsActive] = useState(false);
  const [positions, setPositions] = useState([]);

  const toggleDetection = () => {
    setIsActive(prev => {
      const newState = !prev;
      if (!newState) {
        // Clear positions when stopping
        setPositions([]);
      }
      return newState;
    });
  };

  const handlePositionUpdate = useCallback((newPos) => {
    setPositions(prev => {
      // Only add if position changed significantly (reduce jitter)
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const dx = Math.abs(newPos.x - last.x);
        const dy = Math.abs(newPos.y - last.y);
        if (dx < 0.005 && dy < 0.005) {
          return prev; // Too small a change, skip
        }
      }
      
      // Add new position and keep only last MAX_TRAIL_LENGTH points
      const updated = [...prev, newPos];
      return updated.slice(-MAX_TRAIL_LENGTH);
    });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Color Blob Detection Dashboard</h1>
        <p>Real-time object tracking with OpenCV</p>
        <button 
          className={`control-button ${isActive ? 'active' : 'inactive'}`}
          onClick={toggleDetection}
        >
          {isActive ? '⏸ Stop Detection' : '▶ Start Detection'}
        </button>
      </header>
      <div className="main-container">
        <VideoPanel isActive={isActive} positions={positions} />
        <ControlPanel isActive={isActive} onPositionUpdate={handlePositionUpdate} />
      </div>
    </div>
  );
}

export default App;
