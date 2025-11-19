import { useEffect, useRef } from 'react';
import './PathTracker.css';

function PathTracker({ positions, isActive }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = (width / 4) * i;
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw title
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Position Tracker', 5, 15);

    if (!isActive || positions.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '11px Arial';
      ctx.fillText('Waiting for detection...', 5, height - 10);
      return;
    }

    // Draw path trail
    if (positions.length > 1) {
      for (let i = 1; i < positions.length; i++) {
        const prev = positions[i - 1];
        const curr = positions[i];

        // Calculate opacity based on position in array (fade older points)
        const alpha = i / positions.length;
        
        // Convert normalized coords (0-1) to canvas coords
        const x1 = prev.x * width;
        const y1 = prev.y * height;
        const x2 = curr.x * width;
        const y2 = curr.y * height;

        // Draw line segment
        ctx.strokeStyle = `rgba(76, 175, 80, ${alpha * 0.8})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Draw small circle at each point
        ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x2, y2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw current position (larger dot)
    if (positions.length > 0) {
      const current = positions[positions.length - 1];
      const x = current.x * width;
      const y = current.y * height;

      // Outer glow
      ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Inner dot
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw coordinates
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText(`(${current.x.toFixed(2)}, ${current.y.toFixed(2)})`, 5, height - 10);
    }

  }, [positions, isActive]);

  return (
    <div className="path-tracker">
      <canvas 
        ref={canvasRef} 
        width={200} 
        height={200}
        className="tracker-canvas"
      />
    </div>
  );
}

export default PathTracker;

