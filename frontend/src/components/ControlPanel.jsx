import StatusPanel from './StatusPanel';
import SettingsPanel from './SettingsPanel';
import ChatInput from './ChatInput';
import './ControlPanel.css';

function ControlPanel({ isActive, onPositionUpdate }) {
  return (
    <div className="control-panel">
      <StatusPanel isActive={isActive} onPositionUpdate={onPositionUpdate} />
      <SettingsPanel isActive={isActive} />
      <ChatInput isActive={isActive} />
    </div>
  );
}

export default ControlPanel;

