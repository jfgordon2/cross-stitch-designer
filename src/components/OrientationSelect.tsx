import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { StitchType, Orientation } from '../types';
import { ORIENTATION_OPTIONS } from '../constants';
import { StitchSVG } from './StitchSVG';
import { OrientationSelectModal } from './OrientationSelectModal';
import './OrientationSelect.css';

interface OrientationSelectProps {
  selectedStitch: StitchType;
  selectedOrientation: string;
  onOrientationChange: (orientation: string) => void;
}

const SelectButton = memo(({ 
  selectedStitch, 
  selectedOrientation, 
  size,
  onClick 
}: { 
  selectedStitch: StitchType; 
  selectedOrientation: string;
  size: number;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="orientation-button"
  >
    <StitchSVG
      type={selectedStitch}
      orientation={parseInt(selectedOrientation, 10) as Orientation}
      color={{ r: 0, g: 0, b: 0, a: 255 }}
      size={size}
    />
  </button>
));

SelectButton.displayName = 'SelectButton';

const OrientationSelectComponent: React.FC<OrientationSelectProps> = ({
  selectedStitch,
  selectedOrientation,
  onOrientationChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMobileState = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    return () => window.removeEventListener('resize', updateMobileState);
  }, []);

  useEffect(() => {
    const updateButtonRect = () => {
      if (buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    };

    if (isOpen) {
      updateButtonRect();
      window.addEventListener('scroll', updateButtonRect);
      window.addEventListener('resize', updateButtonRect);
    }

    return () => {
      window.removeEventListener('scroll', updateButtonRect);
      window.removeEventListener('resize', updateButtonRect);
    };
  }, [isOpen]);

  const handleOptionClick = useCallback((orientation: string) => {
    onOrientationChange(orientation);
    setIsOpen(false);
  }, [onOrientationChange]);

  const orientations = ORIENTATION_OPTIONS[selectedStitch];
  const stitchSize = isMobile ? 36 : 28;

  // If there's only one orientation, just show it without dropdown functionality
  if (orientations.length === 1) {
    return (
      <SelectButton
        selectedStitch={selectedStitch}
        selectedOrientation={orientations[0]}
        size={stitchSize}
        onClick={() => {}}
      />
    );
  }

  return (
    <div ref={buttonRef} className="orientation-container">
      <SelectButton
        selectedStitch={selectedStitch}
        selectedOrientation={selectedOrientation}
        size={stitchSize}
        onClick={() => {
          if (buttonRef.current) {
            setButtonRect(buttonRef.current.getBoundingClientRect());
          }
          setIsOpen(!isOpen);
        }}
      />
      
      {isOpen && (
        <OrientationSelectModal
          selectedStitch={selectedStitch}
          selectedOrientation={selectedOrientation}
          orientations={orientations}
          buttonRect={buttonRect}
          stitchSize={stitchSize}
          onOptionClick={handleOptionClick}
        />
      )}
    </div>
  );
};

OrientationSelectComponent.displayName = 'OrientationSelect';

export const OrientationSelect = memo(OrientationSelectComponent);