import React, { useState, useEffect, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { BackgroundImage } from '../types';
import { getModalStyle } from '../utils/modalUtils';
import arrowLeftIcon from '../assets/arrow-left-circle-outline.svg';
import arrowRightIcon from '../assets/arrow-right-circle-outline.svg';
import arrowUpIcon from '../assets/arrow-up-circle-outline.svg';
import arrowDownIcon from '../assets/arrow-down-circle-outline.svg';
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

  const baseStyle: CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  };

  const modal = (
    <div 
      className="background-editor-modal"
      style={getModalStyle(isMobile, buttonRect, baseStyle)}
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

        <div className="position-controls">
          <label>Position:</label>
          <div className="direction-buttons">
            <button 
              onClick={() => onPositionChange(-10, 0)}
              className="toolbar-button"
            >
              <img src={arrowLeftIcon} alt="Move left" />
            </button>
            <button 
              onClick={() => onPositionChange(0, -10)}
              className="toolbar-button"
            >
              <img src={arrowUpIcon} alt="Move up" />
            </button>
            <button 
              onClick={() => onPositionChange(0, 10)}
              className="toolbar-button"
            >
              <img src={arrowDownIcon} alt="Move down" />
            </button>
            <button 
              onClick={() => onPositionChange(10, 0)}
              className="toolbar-button"
            >
              <img src={arrowRightIcon} alt="Move right" />
            </button>
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