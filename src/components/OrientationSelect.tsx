import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { StitchType, Orientation } from '../types';
import { ORIENTATION_OPTIONS } from '../constants';
import { StitchSVG } from './StitchSVG';
import './OrientationSelect.css';

interface OrientationSelectProps {
  selectedStitch: StitchType;
  selectedOrientation: string;
  onOrientationChange: (orientation: string) => void;
}

const SelectButton = memo(({ 
  selectedStitch, 
  selectedOrientation, 
  onClick 
}: { 
  selectedStitch: StitchType; 
  selectedOrientation: string;
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
      size={28}
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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = useCallback((orientation: string) => {
    onOrientationChange(orientation);
    setIsOpen(false);
  }, [onOrientationChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const orientations = ORIENTATION_OPTIONS[selectedStitch];

  // If there's only one orientation, just show it without dropdown functionality
  if (orientations.length === 1) {
    return (
      <SelectButton
        selectedStitch={selectedStitch}
        selectedOrientation={orientations[0]}
        onClick={() => {}}
      />
    );
  }

  return (
    <div ref={containerRef} className="orientation-container">
      <SelectButton
        selectedStitch={selectedStitch}
        selectedOrientation={selectedOrientation}
        onClick={() => setIsOpen(!isOpen)}
      />
      
      {isOpen && (
        <div className="orientation-dropdown">
          {orientations.map((orientation) => (
            <button
              key={orientation}
              onClick={() => handleOptionClick(orientation)}
              className={`orientation-option ${orientation === selectedOrientation ? 'selected' : ''}`}
            >
              <StitchSVG
                type={selectedStitch}
                orientation={parseInt(orientation, 10) as Orientation}
                color={{ r: 0, g: 0, b: 0, a: 255 }}
                size={28}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

OrientationSelectComponent.displayName = 'OrientationSelect';

export const OrientationSelect = memo(OrientationSelectComponent);