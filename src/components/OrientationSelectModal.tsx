import React, { useState, useEffect, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { StitchType, Orientation } from '../types';
import { StitchSVG } from './StitchSVG';
import { getModalStyle } from '../utils/modalUtils';
import './OrientationSelect.css';

interface OrientationSelectModalProps {
  selectedStitch: StitchType;
  selectedOrientation: string;
  orientations: readonly string[];
  buttonRect: DOMRect | null;
  stitchSize: number;
  onOptionClick: (orientation: string) => void;
}

export const OrientationSelectModal: React.FC<OrientationSelectModalProps> = ({
  selectedStitch,
  selectedOrientation,
  orientations,
  buttonRect,
  stitchSize,
  onOptionClick,
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
      className="orientation-dropdown"
      style={getModalStyle(isMobile, buttonRect, baseStyle)}
    >
      {orientations.map((orientation) => (
        <button
          key={orientation}
          onClick={() => onOptionClick(orientation)}
          className={`orientation-option ${orientation === selectedOrientation ? 'selected' : ''}`}
        >
          <StitchSVG
            type={selectedStitch}
            orientation={parseInt(orientation, 10) as Orientation}
            color={{ r: 0, g: 0, b: 0, a: 255 }}
            size={stitchSize}
          />
        </button>
      ))}
    </div>
  );

  return createPortal(modal, modalRoot);
};