import { useState } from 'react';
import { API_BASE_URL } from '../config';
import './ChatInput.css';

function ChatInput({ isActive }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Welcome! Start detection and type a color blob to detect (e.g., "red blob", "blue blob", "green blob")' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isActive) {
      setMessages(prev => [...prev, {
        role: 'system',
        text: '⚠️ Please start detection first'
      }]);
      setInput('');
      return;
    }

    // Add user message
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/config/target`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(prev => [...prev, {
          role: 'system',
          text: `✓ Switched to ${data.current_target_color} blob`
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'system',
          text: `✗ ${data.error || 'Unknown error occurred'}`
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'system',
        text: `✗ Error: Could not connect to server`
      }]);
    }

    setInput('');
  };

  return (
    <div className="chat-input">
      <h3>Control Panel</h3>
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <span className="message-text">{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isActive ? "Type a color (e.g., 'blue blob')..." : "Start detection first..."}
          className="text-input"
          disabled={!isActive}
        />
        <button type="submit" className="send-button" disabled={!isActive}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatInput;

