import { API_BASE_URL } from '../config';
import PathTracker from './PathTracker';
import './VideoPanel.css';

function VideoPanel({ isActive, positions }) {
  return (
    <div className="video-panel">
      <h2>Live Video Stream</h2>
      <div className="video-container">
        {isActive ? (
          <>
            <img 
              src={`${API_BASE_URL}/video`}
              alt="Video stream"
              className="video-stream"
            />
            <PathTracker positions={positions} isActive={isActive} />
          </>
        ) : (
          <div className="video-placeholder">
            <div className="placeholder-content">
              <div className="play-icon">▶</div>
              <p>Click "Start Detection" to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPanel;

