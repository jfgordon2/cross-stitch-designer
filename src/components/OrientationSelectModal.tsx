import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import { StitchType, Orientation } from '../types';
import { StitchSVG } from './StitchSVG';
import './OrientationSelect.css';

interface OrientationSelectModalProps {
  selectedStitch: StitchType;
  selectedOrientation: string;
  orientations: readonly string[];
  stitchSize: number;
  onOptionClick: (orientation: string) => void;
}

export const OrientationSelectModal: React.FC<OrientationSelectModalProps> = ({
  selectedStitch,
  selectedOrientation,
  orientations,
  stitchSize,
  onOptionClick,
}) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const modal = (
    <div 
      className="orientation-dropdown"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        pointerEvents: 'auto',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}
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