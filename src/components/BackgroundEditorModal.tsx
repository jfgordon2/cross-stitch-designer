import React, { useState, useEffect, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { BackgroundImage } from '../types';
import './BackgroundEditor.css';

interface BackgroundEditorModalProps {
  background: BackgroundImage;
  buttonRect: DOMRect | null;
  onOpacityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScaleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPositionChange: (dx: number, dy: number) => void;
  onDone: () => void;
  onRemoveBackground: () => void;
}

export const BackgroundEditorModal: React.FC<BackgroundEditorModalProps> = ({
  background,
  buttonRect,
  onOpacityChange,
  onScaleChange,
  onPositionChange,
  onDone,
  onRemoveBackground,
}) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateIsMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    
    mediaQuery.addEventListener('change', updateIsMobile);
    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  const getModalStyle = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      pointerEvents: 'auto',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    };

    if (isMobile) {
      return {
        ...baseStyle,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    if (!buttonRect) return baseStyle;

    return {
      ...baseStyle,
      top: buttonRect.bottom + window.scrollY + 4,
      left: buttonRect.left + window.scrollX
    };
  };

  const modal = (
    <div 
      className="background-editor-modal"
      style={getModalStyle()}
    >
      <div className="background-sliders">
        <div className="background-slider-group">
          <label>Opacity:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={background.opacity}
            onChange={onOpacityChange}
          />
        </div>

        <div className="background-slider-group">
          <label>Scale:</label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={background.scale}
            onChange={onScaleChange}
          />
        </div>

        <div className="background-slider-group">
          <label>Position:</label>
          <div className="background-buttons">
            <button onClick={() => onPositionChange(0, -10)}>↑</button>
            <button onClick={() => onPositionChange(-10, 0)}>←</button>
            <button onClick={() => onPositionChange(10, 0)}>→</button>
            <button onClick={() => onPositionChange(0, 10)}>↓</button>
          </div>
        </div>
      </div>

      <div className="background-buttons">
        <button onClick={onDone} className="toolbar-button">Done</button>
        <button onClick={onRemoveBackground} className="toolbar-button">Remove Background</button>
      </div>
    </div>
  );

  return createPortal(modal, modalRoot);
};